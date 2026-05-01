package com.pixelbloom.authLogin.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.authLogin.entity.Coupon;
import com.pixelbloom.authLogin.entity.DemoBooking;
import com.pixelbloom.authLogin.entity.DemoSlot;
import com.pixelbloom.authLogin.entity.VisitorNotification;
import com.pixelbloom.authLogin.enums.DemoBookingStatus;
import com.pixelbloom.authLogin.repository.CouponRepository;
import com.pixelbloom.authLogin.repository.DemoBookingRepository;
import com.pixelbloom.authLogin.repository.DemoSlotRepository;
import com.pixelbloom.authLogin.repository.VisitorNotificationRepository;
import com.pixelbloom.authLogin.repository.VisitorRepository;
import com.pixelbloom.authLogin.requestdto.BookDemoResponse;
import com.pixelbloom.authLogin.requestdto.PaymentCallbackRequest;
import com.pixelbloom.authLogin.responsedto.BookDemoRequest;
import com.pixelbloom.authLogin.service.DemoBookingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DemoBookingServiceImpl implements DemoBookingService {

    private static final double BASE_DEMO_FEE = 100.0;

    private final DemoBookingRepository bookingRepo;
    private final DemoSlotRepository slotRepo;
    private final CouponRepository couponRepo;
    private final VisitorRepository visitorRepo;
    private final VisitorNotificationRepository notificationRepo;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${payment.service.url:http://localhost:9096}")
    private String paymentServiceUrl;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.sms-from:}")
    private String twilioSmsFrom;

    @Value("${app.self.url:http://localhost:2000}")
    private String selfUrl;

    @Override
    @Transactional
    public BookDemoResponse initiateBooking(BookDemoRequest request) {

        // 1. Validate slot
        DemoSlot slot = slotRepo.findByBatchTypeAndSlotType(request.getBatchType(), request.getSlotType())
                .orElseThrow(() -> new RuntimeException(
                        "No slot found for " + request.getBatchType() + " / " + request.getSlotType()));

        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new RuntimeException("Slot is fully booked. Please choose another slot.");
        }

        if (bookingRepo.existsByVisitorIdAndSlotId(request.getVisitorId(), slot.getSlotId())) {
            throw new RuntimeException("You have already booked this demo slot.");
        }

        // 2. Apply coupon
        double originalAmount  = BASE_DEMO_FEE;
        double discountApplied = 0.0;
        String couponUsed      = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepo.findByCodeAndActiveTrue(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Invalid or expired coupon: " + request.getCouponCode()));

            if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {
                discountApplied = Math.min(coupon.getDiscountValue(), originalAmount);
            } else if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
                discountApplied = (coupon.getDiscountValue() / 100.0) * originalAmount;
            }
            couponUsed = coupon.getCode();
        }

        double finalAmount = Math.max(0.0, originalAmount - discountApplied);

        // 3. Generate order number
        String orderNumber = "ORD-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (System.currentTimeMillis() % 100000);

        // 4. Build and save booking
        DemoBooking booking = new DemoBooking();
        booking.setVisitorId(request.getVisitorId());
        booking.setSlotId(slot.getSlotId());
        booking.setOrderNumber(orderNumber);
        booking.setOriginalAmount(originalAmount);
        booking.setDiscountApplied(discountApplied);
        booking.setFinalAmount(finalAmount);
        booking.setCouponUsed(couponUsed);

        String timeSlot = slot.getStartTime() + " - " + slot.getEndTime();

        // 5. Free booking — confirm immediately and update visitor record
        if (finalAmount == 0.0) {
            booking.setStatus(DemoBookingStatus.FREE);
            booking.setConfirmedAt(LocalDateTime.now());
            slot.setBookedCount(slot.getBookedCount() + 1);
            slotRepo.save(slot);
            bookingRepo.save(booking);

            // Update visitor with booked slot details
            updateVisitorWithBooking(request.getVisitorId(), slot, timeSlot, request.getDemoDate());

            return new BookDemoResponse(
                    request.getVisitorId(),
                    slot.getBatchType().name(), slot.getSlotType().name(), timeSlot,
                    originalAmount, discountApplied, 0.0, couponUsed,
                    "Demo booked FREE using coupon. Booking confirmed! OrderNumber: " + orderNumber);
        }

        // 6. Paid booking — call payment-service
        booking.setStatus(DemoBookingStatus.PENDING_PAYMENT);
        bookingRepo.save(booking);
        updateVisitorWithBooking(request.getVisitorId(), slot, timeSlot, request.getDemoDate());

        String paymentUrl = createPaymentOrder(request.getVisitorId(), orderNumber, finalAmount);

        return new BookDemoResponse(
                request.getVisitorId(),
                slot.getBatchType().name(), slot.getSlotType().name(), timeSlot,
                originalAmount, discountApplied, finalAmount, couponUsed,
                "Booking initiated. Complete payment at: " + paymentUrl
                        + " | OrderNumber: " + orderNumber);
    }

    /** Syncs the confirmed booking details back into the visitor record */
    private void updateVisitorWithBooking(Long visitorId, DemoSlot slot, String timeSlot, java.time.LocalDate demoDate) {
        visitorRepo.findById(visitorId).ifPresent(v -> {
            try {
                java.util.List<com.pixelbloom.authLogin.entity.BatchType> preferredBatches = new java.util.ArrayList<>();
                if (v.getPreferredBatchesJson() != null) {
                    try {
                        preferredBatches = objectMapper.readValue(
                            v.getPreferredBatchesJson(),
                            objectMapper.getTypeFactory().constructCollectionType(List.class, com.pixelbloom.authLogin.entity.BatchType.class));
                    } catch (Exception ignored) {
                        preferredBatches = new java.util.ArrayList<>();
                    }
                }
                com.pixelbloom.authLogin.entity.BatchType bookingBatch = new com.pixelbloom.authLogin.entity.BatchType(slot.getBatchType().name(), timeSlot);
                boolean batchExists = preferredBatches.stream().anyMatch(b -> b.getBatchType().equals(bookingBatch.getBatchType()) && b.getTimeSlot().equals(bookingBatch.getTimeSlot()));
                if (!batchExists) {
                    preferredBatches.add(bookingBatch);
                }
                v.setPreferredBatchesJson(objectMapper.writeValueAsString(preferredBatches));
                v.setDemoTimeSlotPreference(slot.getSlotType().name());
                if (demoDate != null) {
                    v.setDemoDatePreference(demoDate);
                }
                visitorRepo.save(v);
            } catch (Exception e) {
                log.warn("Could not update visitor {} with booking details: {}", visitorId, e.getMessage());
            }
        });
    }

    /**
     * Calls payment-service POST /api/payments/order
     * Returns the gateway payment URL for the frontend to redirect to.
     */
    private String createPaymentOrder(Long visitorId, String orderNumber, double amount) {
        Map<String, Object> orderRequest = new LinkedHashMap<>();
        orderRequest.put("customerId",   visitorId);
        orderRequest.put("orderNumber",  orderNumber);
        orderRequest.put("amount",       new java.math.BigDecimal(String.valueOf(amount)));
        orderRequest.put("currency",     "INR");
        orderRequest.put("paymentMethod","UPI");
        orderRequest.put("purpose",      "DEMO_BOOKING");
        orderRequest.put("callbackUrl",  selfUrl + "/api/demo/payments/callback");

        String url = paymentServiceUrl + "/api/payments/order";
        log.info("Calling payment-service: POST {} body={}", url, orderRequest);

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<Map<String, Object>> entity =
                    new org.springframework.http.HttpEntity<>(orderRequest, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(url, entity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            Map<String, Object> responseBody = response.getBody();
            log.info("Payment-service response: status={} body={}", response.getStatusCode(), responseBody);

            if (responseBody != null && responseBody.containsKey("paymentUrl")) {
                return (String) responseBody.get("paymentUrl");
            }
            throw new RuntimeException("Payment service returned no paymentUrl: " + responseBody);
        } catch (org.springframework.web.client.HttpClientErrorException | org.springframework.web.client.HttpServerErrorException e) {
            log.error("Payment-service HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Payment service error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Cannot reach payment-service at {}: {}", url, e.getMessage());
            throw new RuntimeException("Cannot reach payment service at " + url + ". Is it running on port 9096?");
        } catch (Exception e) {
            log.error("Unexpected error calling payment-service: {}", e.getMessage(), e);
            throw new RuntimeException("Payment service error: " + e.getMessage());
        }
    }

    // ─── Step 2: Payment gateway → payment-service → this callback ───────────

    @Override
    @Transactional
    public Map<String, String> handlePaymentCallback(PaymentCallbackRequest callback) {

        DemoBooking booking = bookingRepo.findByOrderNumber(callback.getOrderNumber())
                .orElseThrow(() -> new RuntimeException(
                        "No booking found for order: " + callback.getOrderNumber()));

        if (booking.getStatus() != DemoBookingStatus.PENDING_PAYMENT) {
            return Map.of("message", "Booking already processed. Status: " + booking.getStatus());
        }

        if ("SUCCESS".equalsIgnoreCase(callback.getStatus())) {
            booking.setStatus(DemoBookingStatus.CONFIRMED);
            booking.setTransactionId(callback.getTransactionId());
            booking.setConfirmedAt(LocalDateTime.now());
            bookingRepo.save(booking);

            slotRepo.findById(booking.getSlotId()).ifPresent(slot -> {
                slot.setBookedCount(slot.getBookedCount() + 1);
                slotRepo.save(slot);
            });

            log.info("Demo booking CONFIRMED: order={}, txn={}", callback.getOrderNumber(), callback.getTransactionId());
            return Map.of(
                    "status",        "CONFIRMED",
                    "orderNumber",   callback.getOrderNumber(),
                    "transactionId", callback.getTransactionId(),
                    "message",       "Demo booking confirmed successfully.");
        } else {
            booking.setStatus(DemoBookingStatus.CANCELLED);
            bookingRepo.save(booking);
            log.warn("Demo booking FAILED: order={}", callback.getOrderNumber());
            return Map.of(
                    "status",      "CANCELLED",
                    "orderNumber", callback.getOrderNumber(),
                    "message",     "Payment failed. Booking cancelled.");
        }
    }

    @Override
    public List<?> getBookingsByVisitor(Long visitorId) {
        return bookingRepo.findByVisitorId(visitorId);
    }

    @Override
    public List<DemoSlot> getAvailableSlots() {
        return slotRepo.findAllByOrderByBatchTypeAscSlotTypeAsc();
    }

    @Override
    public List<?> getAllBookings() {
        return bookingRepo.findAllByOrderByBookedAtDesc();
    }

    @Override
    public Map<String, Long> getBookingStats() {
        Map<String, Long> stats = new java.util.LinkedHashMap<>();
        stats.put("total",          bookingRepo.count());
        stats.put("confirmed",      bookingRepo.countByStatus(com.pixelbloom.authLogin.enums.DemoBookingStatus.CONFIRMED));
        stats.put("free",           bookingRepo.countByStatus(com.pixelbloom.authLogin.enums.DemoBookingStatus.FREE));
        stats.put("pending",        bookingRepo.countByStatus(com.pixelbloom.authLogin.enums.DemoBookingStatus.PENDING_PAYMENT));
        stats.put("cancelled",      bookingRepo.countByStatus(com.pixelbloom.authLogin.enums.DemoBookingStatus.CANCELLED));
        stats.put("totalSlots",     (long) slotRepo.findAll().stream().mapToInt(s -> s.getCapacity()).sum());
        stats.put("availableSlots", (long) slotRepo.findAll().stream().mapToInt(s -> s.getCapacity() - s.getBookedCount()).sum());
        return stats;
    }

    @Override
    @Transactional
    public Map<String, String> confirmDemoDate(Long bookingId, String date) {
        DemoBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setConfirmedAt(java.time.LocalDateTime.parse(date + "T00:00:00"));
        bookingRepo.save(booking);

        visitorRepo.findById(booking.getVisitorId()).ifPresent(visitor -> {
            try {
                visitor.setDemoDatePreference(LocalDate.parse(date));
                slotRepo.findById(booking.getSlotId()).ifPresent(slot ->
                        visitor.setDemoTimeSlotPreference(slot.getSlotType().name())
                );
                visitorRepo.save(visitor);

                String message = "Your demo session is confirmed for " + date + ". Please arrive 10 minutes early for your MuscleFit session.";
                saveVisitorNotification(visitor.getVisitorId(), message, "DEMO");
                sendSms(visitor.getPhone(), message);
            } catch (Exception e) {
                log.warn("Unable to sync rescheduled demo to visitor {}: {}", booking.getVisitorId(), e.getMessage());
            }
        });

        return Map.of("message", "Demo date confirmed: " + date, "bookingId", String.valueOf(bookingId));
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        DemoBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setStatus(com.pixelbloom.authLogin.enums.DemoBookingStatus.CANCELLED);
        bookingRepo.save(booking);
    }

    private void saveVisitorNotification(Long visitorId, String message, String type) {
        try {
            if (visitorRepo.existsById(visitorId)) {
                VisitorNotification notification = VisitorNotification.builder()
                        .visitorId(visitorId)
                        .message(message)
                        .type(type)
                        .readFlag(false)
                        .build();
                notificationRepo.save(notification);
            }
        } catch (Exception e) {
            log.warn("Failed to save notification for visitor {}: {}", visitorId, e.getMessage());
        }
    }

    private void sendSms(String phone, String message) {
        if (phone == null || phone.isBlank() || twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioSmsFrom.isBlank()) {
            return;
        }
        try {
            com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber("+91" + phone.replaceAll("\\D", "")),
                    new com.twilio.type.PhoneNumber(twilioSmsFrom),
                    message
            ).create();
        } catch (Exception e) {
            log.warn("Twilio SMS failed for {}: {}", phone, e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> createFreeDemoBooking(BookDemoRequest request) {
        DemoSlot slot = slotRepo.findByBatchTypeAndSlotType(request.getBatchType(), request.getSlotType())
                .orElseThrow(() -> new RuntimeException(
                        "No slot found for " + request.getBatchType() + " / " + request.getSlotType()));

        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new RuntimeException("Slot is fully booked. Please choose another slot.");
        }

        if (bookingRepo.existsByVisitorIdAndSlotId(request.getVisitorId(), slot.getSlotId())) {
            throw new RuntimeException("Visitor has already booked this demo slot.");
        }

        String orderNumber = "ORD-ADMIN-"
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (System.currentTimeMillis() % 100000);

        DemoBooking booking = new DemoBooking();
        booking.setVisitorId(request.getVisitorId());
        booking.setSlotId(slot.getSlotId());
        booking.setOrderNumber(orderNumber);
        booking.setOriginalAmount(0.0);
        booking.setDiscountApplied(0.0);
        booking.setFinalAmount(0.0);
        booking.setCouponUsed(null);
        booking.setStatus(DemoBookingStatus.FREE);
        booking.setConfirmedAt(LocalDateTime.now());

        slot.setBookedCount(slot.getBookedCount() + 1);
        slotRepo.save(slot);
        bookingRepo.save(booking);

        String timeSlot = slot.getStartTime() + " - " + slot.getEndTime();
        updateVisitorWithBooking(request.getVisitorId(), slot, timeSlot, request.getDemoDate());

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", booking.getBookingId());
        response.put("orderNumber", orderNumber);
        response.put("status", "FREE");
        response.put("visitorId", request.getVisitorId());
        response.put("message", "Demo booking created successfully by admin");
        return response;
    }

}
