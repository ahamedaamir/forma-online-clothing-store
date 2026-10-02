const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

const {
  createOrderHash,
  createNotifyHash,
  resolveItems,
  validateCustomer,
  amountsMatch,
} = require('../routes/payhere');

function md5(value) {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
}

test('PayHere checkout hash uses the required uppercase MD5 formula', () => {
  const merchantId = '123456';
  const orderId = 'FORMAABC123';
  const amount = '5300.00';
  const currency = 'LKR';
  const secret = 'sandbox-secret';
  const expected = md5(`${merchantId}${orderId}${amount}${currency}${md5(secret)}`);

  assert.equal(createOrderHash(merchantId, orderId, amount, currency, secret), expected);
});

test('PayHere notification signature includes status code', () => {
  const merchantId = '123456';
  const orderId = 'FORMAABC123';
  const amount = '5300.00';
  const currency = 'LKR';
  const statusCode = '2';
  const secret = 'sandbox-secret';
  const expected = md5(`${merchantId}${orderId}${amount}${currency}${statusCode}${md5(secret)}`);

  assert.equal(createNotifyHash(merchantId, orderId, amount, currency, statusCode, secret), expected);
});

test('notification amount must exactly match the saved two-decimal amount', () => {
  assert.equal(amountsMatch('5300.00', '5300.00'), true);
  assert.equal(amountsMatch('5300.0', '5300.00'), false);
  assert.equal(amountsMatch('5300.001', '5300.00'), false);
});

test('order items use the backend product price, not browser-supplied values', () => {
  const resolved = resolveItems([{
    id: 'vanguard-oversized-tee',
    quantity: 2,
    size: 'M',
    color: 'Washed Black',
    price: 0.01,
    name: 'Tampered product name',
  }]);

  assert.equal(resolved.error, undefined);
  assert.equal(resolved.items[0].price, 4950);
  assert.equal(resolved.items[0].lineTotal, 9900);
  assert.equal(resolved.items[0].name, 'Vanguard Oversized Tee');
});

test('unavailable products and invalid variants are rejected', () => {
  assert.match(resolveItems([{
    id: 'nordic-everyday-tote',
    quantity: 1,
    size: 'One Size',
  }]).error, /unavailable/);

  assert.match(resolveItems([{
    id: 'vanguard-oversized-tee',
    quantity: 1,
    size: 'Made Up Size',
  }]).error, /valid size/);
});

test('customer validation normalizes Sri Lankan international phone numbers', () => {
  const result = validateCustomer({
    firstName: 'Forma',
    lastName: 'Customer',
    email: 'buyer@example.com',
    phone: '+94 77 123 4567',
    addressLine1: '12 Main Street',
    city: 'Colombo',
    postalCode: '00100',
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.customer.phone, '0771234567');
  assert.equal(result.customer.country, 'Sri Lanka');
});