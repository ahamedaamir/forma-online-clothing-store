const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('../supabase');

const orders = [];

// POST /api/cart/checkout
router.post('/checkout', async (req, res) => {
  const { items, customer, shippingAddress, total } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart items are required for checkout',
    });
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const calculatedTotal = total || items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  const newOrder = {
    order_id: orderId,
    items,
    customer_email: customer?.email || 'guest@forma.com',
    customer_name: customer?.name || null,
    shipping_address: shippingAddress || 'Standard Delivery',
    total: Number(calculatedTotal),
    status: 'Confirmed',
  };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully in Supabase',
        data: {
          orderId: data.order_id,
          ...data,
        },
      });
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
        .select('*')
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
