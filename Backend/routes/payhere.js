const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const productFile = path.join(__dirname, '..', 'data', 'products.json');
const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');
const products = JSON.parse(fs.readFileSync(productFile, 'utf8'));

function md5(value) {
  return crypto.createHash('md5').update(String(value)).digest('hex').toUpperCase();
}

function createOrderHash(merchantId, orderId, amount, currency, secret) {
  return md5(`${merchantId}${orderId}${amount}${currency}${md5(secret)}`);
}

function createNotifyHash(merchantId, orderId, amount, currency, statusCode, secret) {
  return md5(`${merchantId}${orderId}${amount}${currency}${statusCode}${md5(secret)}`);
}

function safeHashEquals(expected, received) {
  if (typeof received !== 'string' || !/^[a-f0-9]{32}$/i.test(received)) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
}

function readOrders() {
  try {
    const saved = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function writeOrders(orders) {
  fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
  const temporaryFile = `${ordersFile}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(orders, null, 2), { mode: 0o600 });
  fs.renameSync(temporaryFile, ordersFile);
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

function normalizePhone(value) {
  const input = cleanText(value, 32).replace(/[\s()-]/g, '');
  if (/^07\d{8}$/.test(input)) return input;
  if (/^\+947\d{8}$/.test(input)) return `0${input.slice(3)}`;
  if (/^947\d{8}$/.test(input)) return `0${input.slice(2)}`;
  return '';
}

function validateCustomer(value) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const customer = {
    firstName: cleanText(raw.firstName, 60),
    lastName: cleanText(raw.lastName, 60),
    email: cleanText(raw.email, 254).toLowerCase(),
    phone: normalizePhone(raw.phone),
    addressLine1: cleanText(raw.addressLine1, 160),
    addressLine2: cleanText(raw.addressLine2, 160),
    city: cleanText(raw.city, 80),
    postalCode: cleanText(raw.postalCode, 12),
    country: 'Sri Lanka',
  };
  const errors = {};

  if (!customer.firstName) errors.firstName = 'Enter your first name.';
  if (!customer.lastName) errors.lastName = 'Enter your last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.email = 'Enter a valid email address.';
  if (!customer.phone) errors.phone = 'Enter a valid Sri Lankan mobile number.';
  if (!customer.addressLine1) errors.addressLine1 = 'Enter your address.';
  if (!customer.city) errors.city = 'Enter your city.';
  if (!/^[a-zA-Z0-9 -]{3,12}$/.test(customer.postalCode)) errors.postalCode = 'Enter a valid postal code.';

  return { customer, errors };
}

function resolveItems(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) {
    return { error: 'Add between 1 and 50 cart items before checkout.' };
  }

  const items = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { error: 'One or more cart items are invalid.' };
    }

    const id = cleanText(raw.id, 120);
    const product = products.find((item) => item.slug === id);
    const quantity = Number(raw.quantity);
    if (!product || product.inStock === false) {
      return { error: 'One or more items are unavailable.' };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9) {
      return { error: `Quantity for ${product.name} must be between 1 and 9.` };
    }

    const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ['One Size'];
    const size = cleanText(raw.size, 24);
    if (!sizes.includes(size)) return { error: `Choose a valid size for ${product.name}.` };

    const colorways = Array.isArray(product.colorways) ? product.colorways : [];
    const requestedColor = cleanText(raw.color, 60);
    const color = requestedColor || colorways[0]?.colorName || '';
    if (requestedColor && !colorways.some((variant) => variant.colorName === requestedColor)) {
      return { error: `Choose a valid color for ${product.name}.` };
    }

    const colorway = colorways.find((variant) => variant.colorName === color);
    const unitCents = Math.round(Number(product.price) * 100);
    items.push({
      id: product.slug,
      name: product.name,
      price: unitCents / 100,
      quantity,
      size,
      color,
      image: colorway?.primaryImage || product.image || '',
      lineTotal: (unitCents * quantity) / 100,
    });
  }

  return { items };
}

function formatAmount(cents) {
  return (cents / 100).toFixed(2);
}

function amountsMatch(received, expected) {
  return typeof received === 'string' && /^\d+\.\d{2}$/.test(received) && received === String(expected);
}

function getDeliveryCents() {
  const fee = Number(process.env.DELIVERY_FEE ?? 350);
  if (!Number.isFinite(fee) || fee < 0 || fee > 1000000) return null;
  return Math.round(fee * 100);
}

function getPublicUrl(value, fallback) {
  const url = new URL(value || fallback);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid public URL protocol');
  return url.toString().replace(/\/$/, '');
}

function createOrder(req, res) {
  const merchantId = cleanText(process.env.PAYHERE_MERCHANT_ID, 80);
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) {
    return res.status(503).json({ success: false, message: 'PayHere Sandbox is not configured on the server.' });
  }

  const { items, error: itemError } = resolveItems(req.body?.items);
  if (itemError) return res.status(400).json({ success: false, message: itemError });

  const { customer, errors } = validateCustomer(req.body?.customer);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: 'Check the customer details.', errors });
  }

  const deliveryCents = getDeliveryCents();
  if (deliveryCents === null) {
    return res.status(500).json({ success: false, message: 'The delivery fee is invalid in server configuration.' });
  }

  let baseUrl;
  let frontendUrl;
  try {
    let rawBase = process.env.BASE_URL;
    if (!rawBase || rawBase.includes('payhere.lk')) {
      rawBase = `http://localhost:${process.env.PORT || 5000}`;
    }
    baseUrl = getPublicUrl(rawBase);
    frontendUrl = getPublicUrl(process.env.FRONTEND_URL, 'http://localhost:3000');
  } catch {
    return res.status(500).json({ success: false, message: 'The checkout URLs are invalid in server configuration.' });
  }

  const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  const totalCents = subtotalCents + deliveryCents;
  if (!Number.isSafeInteger(totalCents) || totalCents < 1) {
    return res.status(400).json({ success: false, message: 'The order total is invalid.' });
  }

  const orderId = `F${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const amount = formatAmount(totalCents);
  const currency = 'LKR';
  const itemDescription = items.map((item) => `${item.quantity}x ${item.name}`).join(', ').slice(0, 255);
  const order = {
    orderId,
    status: 'pending',
    currency,
    amount,
    subtotal: formatAmount(subtotalCents),
    deliveryFee: formatAmount(deliveryCents),
    customer,
    items,
    createdAt: new Date().toISOString(),
  };

  try {
    const orders = readOrders();
    orders.push(order);
    writeOrders(orders);
  } catch (error) {
    console.error('[Checkout] Failed to save order:', error.message);
    return res.status(500).json({ success: false, message: 'Could not save this order.' });
  }

  const fields = {
    merchant_id: merchantId,
    return_url: `${frontendUrl}/checkout/success`,
    cancel_url: `${frontendUrl}/checkout/cancel`,
    notify_url: `${baseUrl}/api/payhere/notify`,
    order_id: orderId,
    items: itemDescription,
    currency,
    amount,
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    address: [customer.addressLine1, customer.addressLine2].filter(Boolean).join(', '),
    city: customer.city,
    country: customer.country,
    hash: createOrderHash(merchantId, orderId, amount, currency, merchantSecret),
  };

  console.log(`[Checkout] Order ${orderId} created with pending status for LKR ${amount}.`);
  console.log(`[PayHere] Server-side hash generated for order ${orderId}.`);
  return res.status(201).json({
    success: true,
    order: {
      orderId,
      status: order.status,
      currency,
      amount,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      items,
    },
    fields,
  });
}

function notify(req, res) {
  const body = req.body || {};
  const merchantId = String(body.merchant_id || '');
  const orderId = cleanText(body.order_id, 40);
  const amount = String(body.payhere_amount || '');
  const currency = String(body.payhere_currency || '');
  const statusCode = String(body.status_code || '');
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
  console.log(`[PayHere] Notify received for order ${orderId || '(missing order id)'}.`);

  if (!merchantSecret || merchantId !== String(process.env.PAYHERE_MERCHANT_ID || '')) {
    console.warn(`[PayHere] Signature invalid for order ${orderId || '(missing order id)'}.`);
    return res.status(200).send('OK');
  }

  const expected = createNotifyHash(merchantId, orderId, amount, currency, statusCode, merchantSecret);
  if (!safeHashEquals(expected, body.md5sig)) {
    console.warn(`[PayHere] Signature invalid for order ${orderId || '(missing order id)'}.`);
    return res.status(200).send('OK');
  }
  console.log(`[PayHere] Signature valid for order ${orderId}.`);

  try {
    const orders = readOrders();
    const order = orders.find((item) => item.orderId === orderId);
    if (!order) {
      console.warn(`[PayHere] No saved order found for verified notification ${orderId}.`);
      return res.status(200).send('OK');
    }

    const amountMatches = amountsMatch(amount, order.amount);
    const currencyMatches = currency === order.currency;
    const nextStatus = amountMatches && currencyMatches && statusCode === '2' ? 'paid' : 'failed';

    if (order.status !== 'paid' && order.status !== nextStatus) {
      order.status = nextStatus;
      order.updatedAt = new Date().toISOString();
      order.payherePaymentId = cleanText(body.payment_id, 100);
      writeOrders(orders);
      console.log(`[Checkout] Order ${orderId} status updated to ${nextStatus}.`);
    }
  } catch (error) {
    console.error(`[PayHere] Could not update order ${orderId}:`, error.message);
  }

  return res.status(200).send('OK');
}

function getOrder(req, res) {
  let orderId = cleanText(req.params.id, 80);
  if (orderId.includes(',')) orderId = orderId.split(',')[0].trim();
  try {
    const order = readOrders().find((item) => item.orderId === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.set('Cache-Control', 'no-store');
    return res.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        currency: order.currency,
        amount: order.amount,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error(`[Checkout] Could not read order ${orderId}:`, error.message);
    return res.status(500).json({ success: false, message: 'Could not load this order.' });
  }
}

function confirmSandboxOrder(req, res) {
  let orderId = cleanText(req.params.id || req.body?.orderId, 80);
  if (orderId.includes(',')) orderId = orderId.split(',')[0].trim();
  try {
    const orders = readOrders();
    const order = orders.find((item) => item.orderId === orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.status !== 'paid') {
      order.status = 'paid';
      order.updatedAt = new Date().toISOString();
      order.payherePaymentId = 'SANDBOX_' + Date.now();
      writeOrders(orders);
      console.log(`[PayHere Sandbox] Order ${orderId} confirmed.`);
    }

    return res.json({
      success: true,
      message: 'Order confirmed successfully.',
      order: {
        orderId: order.orderId,
        status: order.status,
        currency: order.currency,
        amount: order.amount,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        items: order.items,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error(`[Checkout] Could not update order ${orderId}:`, error.message);
    return res.status(500).json({ success: false, message: 'Could not update this order.' });
  }
}

module.exports = {
  createOrder,
  notify,
  getOrder,
  confirmSandboxOrder,
  createOrderHash,
  createNotifyHash,
  resolveItems,
  validateCustomer,
  amountsMatch,
};