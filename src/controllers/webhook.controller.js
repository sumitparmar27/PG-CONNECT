const razorpayService = require("../services/razorpay.service");
const bookingService = require("../services/booking.service");
const asyncHandler = require("../utils/asyncHandler");

// Razorpay calls this server-to-server once a payment is captured, independent of
// whether the tenant's browser stayed open long enough to hit /verify. Requires
// RAZORPAY_WEBHOOK_SECRET to be set and the webhook URL registered on the
// Razorpay dashboard — only reachable in an environment Razorpay's servers can see
// (not a bare localhost dev box), so this is a production-time safety net.
const razorpay = asyncHandler(async (req, res) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return res.status(501).json({ message: "Webhook secret is not configured" });
  }

  const signature = req.headers["x-razorpay-signature"];
  const isValid = razorpayService.verifyWebhookSignature({ rawBody: req.body, signature });
  if (!isValid) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const payload = JSON.parse(req.body.toString());
  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    await bookingService.markPaidFromWebhook({
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
    });
  }

  res.status(200).json({ received: true });
});

module.exports = { razorpay };
