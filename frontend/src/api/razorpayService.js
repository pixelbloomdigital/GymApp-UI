import api from './axios';

/**
 * Opens Razorpay checkout for membership payment.
 *
 * Flow:
 *  1. POST /api/payments/order  → get razorpayOrderId + keyId
 *  2. Open Razorpay checkout modal
 *  3. On success → POST /api/payments/razorpay/verify → backend confirms + activates membership
 *
 * @param {object} opts
 * @param {number}  opts.amount        - amount in INR
 * @param {string}  opts.orderNumber   - your internal order number (from assignMembership response)
 * @param {string}  opts.name          - payer name
 * @param {string}  opts.email         - payer email
 * @param {string}  opts.phone         - payer phone
 * @param {string}  opts.description   - e.g. "3 Month Premium Plan"
 * @param {function} opts.onSuccess    - called with { razorpayPaymentId, orderNumber }
 * @param {function} opts.onFailure    - called with error message string
 */
export async function openRazorpayCheckout({ amount, orderNumber, name, email, phone, description, onSuccess, onFailure }) {
  try {
    // Step 1: Create Razorpay order on backend
    const orderRes = await api.post('/api/payments/order', {
      orderNumber,
      amount,
      currency: 'INR',
      purpose: 'MEMBERSHIP',
    });

    const { razorpayOrderId, keyId } = orderRes.data;

    if (!razorpayOrderId || !keyId) {
      onFailure?.('Failed to create payment order. Please try again.');
      return;
    }

    // Step 2: Open Razorpay checkout
    const options = {
      key: keyId,
      amount: amount * 100, // paise
      currency: 'INR',
      name: 'MuscleFit Gym',
      description,
      order_id: razorpayOrderId,
      prefill: { name, email, contact: phone },
      theme: { color: '#3e0994' },
      handler: async (response) => {
        // Step 3: Verify payment on backend
        try {
          await api.post('/api/payments/razorpay/verify', {
            orderNumber,
            razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onSuccess?.({ razorpayPaymentId: response.razorpay_payment_id, orderNumber });
        } catch (err) {
          onFailure?.(err.response?.data?.message || 'Payment verification failed.');
        }
      },
      modal: {
        ondismiss: () => onFailure?.('Payment cancelled by user.'),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      onFailure?.(resp.error?.description || 'Payment failed.');
    });
    rzp.open();

  } catch (err) {
    onFailure?.(err.response?.data?.message || 'Could not initiate payment. Please try again.');
  }
}
