// Minimal typing for the Razorpay Checkout script loaded via a <script> tag in
// index.html (client/index.html). See https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
export interface RazorpaySuccessResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayCheckoutInstance {
  open: () => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance
  }
}
