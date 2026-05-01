package com.pixelbloom.payment.gateway;

import com.pixelbloom.payment.config.RazorpayConfig;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;

/**
 * Razorpay payment gateway integration.
 *
 * Flow:
 *   1. Backend creates Razorpay order → returns { orderId, amount, currency, keyId }
 *   2. Frontend opens Razorpay checkout with those details
 *   3. User pays → Razorpay calls webhook POST /api/payments/razorpay/webhook
 *   4. Backend verifies HMAC signature → confirms booking
 *
 * Test cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/
 *   Card: 4111 1111 1111 1111  Expiry: any future  CVV: any
 *   UPI:  success@razorpay
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RazorpayGateway {

    private final RazorpayConfig config;

    /**
     * Creates a Razorpay order.
     *
     * @param orderNumber  your internal order ID
     * @param amount       amount in INR (will be converted to paise)
     * @param currency     "INR"
     * @return Razorpay orderId e.g. "order_ABC123"
     */
    public String createOrder(String orderNumber, BigDecimal amount, String currency) {
        try {
            RazorpayClient client = new RazorpayClient(config.getKeyId(), config.getKeySecret());

            JSONObject options = new JSONObject();
            options.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // paise
            options.put("currency", currency != null ? currency : "INR");
            options.put("receipt", orderNumber);
            options.put("payment_capture", 1); // auto-capture

            Order order = client.orders.create(options);
            String razorpayOrderId = order.get("id");
            log.info("Razorpay order created: {} → {}", orderNumber, razorpayOrderId);
            return razorpayOrderId;

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Razorpay order creation failed: " + e.getMessage());
        }
    }

    /**
     * Verifies Razorpay webhook signature.
     * Razorpay sends X-Razorpay-Signature header = HMAC-SHA256(payload, webhookSecret)
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            if (config.getWebhookSecret() == null || config.getWebhookSecret().isBlank()) {
                log.warn("Webhook secret not configured — skipping signature verification");
                return true;
            }
            String expected = hmacSha256(payload, config.getWebhookSecret());
            return expected.equals(signature);
        } catch (Exception e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifies payment signature after frontend checkout completes.
     * Razorpay signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String data     = razorpayOrderId + "|" + razorpayPaymentId;
            String expected = hmacSha256(data, config.getKeySecret());
            return expected.equals(signature);
        } catch (Exception e) {
            log.error("Payment signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        Formatter formatter = new Formatter();
        for (byte b : hash) formatter.format("%02x", b);
        return formatter.toString();
    }
}
