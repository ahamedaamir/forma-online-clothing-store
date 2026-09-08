const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('../supabase');

const orders = [];

// POST /api/cart/validate-coupon
router.post('/validate-coupon', async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const cleanCode = String(code).trim().toUpperCase();

  if (isConfigured && supabase) {
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (!error && coupon) {
        const subtotal = Number(cartTotal) || 0;
        if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount for this coupon is LKR ${Number(coupon.min_order_amount).toLocaleString()}`,
          });
        }

        let discount = 0;
        if (coupon.type === 'PERCENT') {
          discount = (subtotal * Number(coupon.value)) / 100;
        } else {
          discount = Number(coupon.value);
        }

        return res.json({
          success: true,
          data: {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            discountAmount: discount,
          },
        });
      }
    } catch (err) {
      console.warn('Supabase coupon check failed:', err.message);
    }
  }

  // Local fallback coupons
  const mockCoupons = {
    WELCOME10: { type: 'PERCENT', value: 10, min: 2000 },
    FORMA500: { type: 'FIXED', value: 500, min: 5000 },
    FREESHIP: { type: 'FIXED', value: 350, min: 3000 },
  };

  const found = mockCoupons[cleanCode];
  if (found) {
    const subtotal = Number(cartTotal) || 0;
    const discount = found.type === 'PERCENT' ? (subtotal * found.value) / 100 : found.value;
    return res.json({
      success: true,
      data: {
        code: cleanCode,
        type: found.type,
        value: found.value,
        discountAmount: discount,
      },
    });
  }

  res.status(404).json({
    success: false,
    message: 'Invalid or expired promo code',
  });
});

// POST /api/cart/checkout
router.post('/checkout', async (req, res) => {
  const { items, customer, shippingAddress, total, paymentMethod, couponCode, discountAmount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart items are required for checkout',
    });
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const calculatedTotal = total || items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  if (isConfigured && supabase) {
    try {
      // 1. Resolve or create user if customer email provided
      let userId = customer?.id || null;
      if (!userId && customer?.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', customer.email.toLowerCase())
          .single();

        if (existingUser) {
          userId = existingUser.id;
        } else {
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              name: customer.name || 'Guest Customer',
              email: customer.email.toLowerCase(),
              password: 'guest_order_account',
              phone: customer.phone || null,
              role: 'customer',
            })
            .select('id')
            .single();
          if (newUser) userId = newUser.id;
        }
      }

      // 2. Insert order into orders table
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: Number(calculatedTotal),
          order_status: 'Confirmed',
          shipping_address: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : (shippingAddress || 'Standard Delivery'),
          order_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 3. Insert order items
      if (orderData) {
        const orderItemsPayload = items.map(item => ({
          order_id: orderData.id,
          product_name: item.name || item.slug || 'Forma Apparel',
          size: item.size || 'M',
          color: item.color || 'Standard',
          quantity: item.qty || 1,
          unit_price: Number(item.price || 0),
          subtotal: Number(item.price || 0) * (item.qty || 1),
        }));

        await supabase.from('order_items').insert(orderItemsPayload);

        // 4. Record payment
        await supabase.from('payments').insert({
          order_id: orderData.id,
          payment_method: paymentMethod || 'Card Payment',
          transaction_id: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          amount: Number(calculatedTotal),
          payment_status: 'Successful',
          payment_date: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        });

        // 5. If coupon was applied, record in order_coupons
        if (couponCode) {
          const { data: couponData } = await supabase
            .from('coupons')
            .select('id')
            .eq('code', String(couponCode).trim().toUpperCase())
            .single();

          if (couponData) {
            await supabase.from('order_coupons').insert({
              order_id: orderData.id,
              coupon_id: couponData.id,
              discount_amount: Number(discountAmount || 0),
            });
          }
        }

        // 6. Create notification
        if (userId) {
          await supabase.from('notifications').insert({
            user_id: userId,
            order_id: orderData.id,
            type: 'ORDER_CONFIRMATION',
            message: `Your order #${orderId} for LKR ${Number(calculatedTotal).toLocaleString()} has been confirmed!`,
            channel: 'in-app',
          });
        }

        return res.status(201).json({
          success: true,
          message: 'Order placed successfully in relational database',
          data: {
            id: orderData.id,
            orderId,
            total: calculatedTotal,
            status: 'Confirmed',
            items,
            customer: customer || { email: 'guest@forma.com' },
            shippingAddress,
            createdAt: orderData.created_at,
          },
        });
      }
    } catch (err) {
      console.warn('Supabase order insert failed, saving locally:', err.message);
    }
  }

  const localOrder = {
    orderId,
    items,
    customer: customer || { email: 'guest@forma.com' },
    shippingAddress: shippingAddress || 'Standard Delivery',
    total: calculatedTotal,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };

  orders.push(localOrder);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: localOrder,
  });
});

// GET /api/cart/orders
router.get('/orders', async (req, res) => {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          payments (*),
          users (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({
        success: true,
        count: data.length,
        data,
      });
    } catch (err) {
      console.warn('Supabase get orders failed:', err.message);
    }
  }

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

module.exports = router;
