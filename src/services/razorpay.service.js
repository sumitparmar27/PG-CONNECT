const Razorpay = require("razorpay");
const { validatePaymentVerification, validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");
const ApiError = require("../utils/ApiError");

let client;

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Payments are not configured yet — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

async function createOrder({ amount, currency = "INR", receipt }) {
  return getClient().orders.create({
    amount: Math.round(amount * 100), // rupees -> paisa
    currency,
    receipt,
    payment_capture: 1,
  });
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  return validatePaymentVerification({ order_id: orderId, payment_id: paymentId }, signature, process.env.RAZORPAY_KEY_SECRET);
}

function verifyWebhookSignature({ rawBody, signature }) {
  return validateWebhookSignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
}

module.exports = { createOrder, verifyPaymentSignature, verifyWebhookSignature };
