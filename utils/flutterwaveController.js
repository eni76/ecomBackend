const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

const FLW_SECRET = process.env.FLW_SECRETE_KEY;
const BASE_URL = 'https://developersandbox-api.flutterwave.com';

// Step 1: Create Customer
exports.createCustomer = async ({ email }) => {
  // fetch user info from DB (omitted for brevity)
  const customerData = { email }; // simplified
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FLW_SECRET}`, 'X-Trace-Id': uuidv4() },
    body: JSON.stringify(customerData)
  });
  const data = await res.json();
  return data.data; // returns customer object including customer.id
};

// Step 2: Create Payment Method
exports.createPaymentMethod = async ({ cardNonce }) => {
  const paymentMethodData = { type: 'card', card: cardNonce };
  const res = await fetch(`${BASE_URL}/payment-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FLW_SECRET}`, 'X-Trace-Id': uuidv4(), 'X-Idempotency-Key': uuidv4() },
    body: JSON.stringify(paymentMethodData)
  });
  const data = await res.json();
  return data.data; // returns paymentMethod object including payment_method_id
};

// Step 3: Initiate Charge
exports.initiateCharge = async ({ customer_id, payment_method_id, amount, currency, reference, redirect_url, meta }) => {
  const chargeData = { customer_id, payment_method_id, amount, currency, reference, redirect_url, meta };
  const res = await fetch(`${BASE_URL}/charges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FLW_SECRET}`, 'X-Idempotency-Key': uuidv4() },
    body: JSON.stringify(chargeData)
  });
  const data = await res.json();
  return data.data;
};

// Step 4: Authorize Charge
exports.authorizeCharge = async ({ chargeId, authorization }) => {
  const res = await fetch(`${BASE_URL}/charges/${chargeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FLW_SECRET}` },
    body: JSON.stringify({ authorization })
  });
  const data = await res.json();
  return data.data;
};

// Step 5: Verify Transaction
exports.verifyTransaction = async ({ reference }) => {
  const res = await fetch(`${BASE_URL}/transactions/${reference}/verify`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${FLW_SECRET}` }
  });
  const data = await res.json();
  return data.data;
};
