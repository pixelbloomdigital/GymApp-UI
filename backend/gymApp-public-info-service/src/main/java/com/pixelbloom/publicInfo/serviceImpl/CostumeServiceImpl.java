package com.pixelbloom.publicInfo.serviceImpl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.pixelbloom.publicInfo.dto.CostumeBookingRequest;
import com.pixelbloom.publicInfo.dto.CostumeRequest;
import com.pixelbloom.publicInfo.dto.PaymentCallbackRequest;
import com.pixelbloom.publicInfo.entity.Costume;
import com.pixelbloom.publicInfo.entity.CostumeBooking;
import com.pixelbloom.publicInfo.enums.BookingStatus;
import com.pixelbloom.publicInfo.enums.CostumeCategory;
import com.pixelbloom.publicInfo.repository.CostumeBookingRepository;
import com.pixelbloom.publicInfo.repository.CostumeRepository;
import com.pixelbloom.publicInfo.service.CostumeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CostumeServiceImpl implements CostumeService {

    private final CostumeRepository costumeRepo;
    private final CostumeBookingRepository bookingRepo;
    private final RestTemplate restTemplate;

    @Value("${payment.service.url:http://localhost:9096}")
    private String paymentServiceUrl;

    @Value("${app.self.url:http://localhost:9097}")
    private String selfUrl;

    // ─── Costume CRUD ─────────────────────────────────────────────────────────

    @Override
    public List<Costume> getAllActiveCostumes() {
        return costumeRepo.findByIsActiveTrueOrderByNameAsc();
    }

    @Override
    public List<Costume> getCostumesByCategory(CostumeCategory category) {
        return costumeRepo.findByCategoryAndIsActiveTrue(category);
    }

    @Override
    public Costume getCostumeById(Long id) {
        Long costumeId = Objects.requireNonNull(id, "costume id is required");
        return costumeRepo.findById(costumeId)
                .orElseThrow(() -> new RuntimeException("Costume not found: " + id));
    }

    @Override
    public Costume createCostume(CostumeRequest req) {
        Costume c = new Costume();
        mapRequest(req, c);
        c.setAvailableQuantity(req.getTotalQuantity());
        return costumeRepo.save(c);
    }

    @Override
    public Costume updateCostume(Long id, CostumeRequest req) {
        Costume c = getCostumeById(id);
        int diff = req.getTotalQuantity() - c.getTotalQuantity();
        mapRequest(req, c);
        c.setAvailableQuantity(Math.max(0, c.getAvailableQuantity() + diff));
        return costumeRepo.save(c);
    }

    @Override
    public void deleteCostume(Long id) {
        Costume c = getCostumeById(id);
        c.setIsActive(false);
        costumeRepo.save(c);
    }

    // ─── Booking ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CostumeBooking initiateBooking(CostumeBookingRequest req) {
        Costume costume = getCostumeById(req.getCostumeId());
        if (costume.getAvailableQuantity() < 1)
            throw new RuntimeException("Costume '" + costume.getName() + "' is not available");

        String bookerType = normalizeBookerType(req.getBookerType());
        String selectedSize = normalizeSelectedSize(req.getSelectedSize());
        validateSelectedSize(costume, selectedSize);

        String orderNumber = "CST-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (System.currentTimeMillis() % 100000);

        CostumeBooking booking = new CostumeBooking();
        booking.setCostumeId(req.getCostumeId());
        booking.setBookerId(req.getBookerId());
        booking.setBookerType(bookerType);
        booking.setBookerName(req.getBookerName());
        booking.setBookerPhone(req.getBookerPhone());
        booking.setBookerAddress(req.getBookerAddress());
        booking.setSelectedSize(selectedSize);
        booking.setPickupDate(req.getPickupDate());
        booking.setReturnDate(req.getReturnDate());
        booking.setAmountPaid(costume.getRentalPrice());
        booking.setOrderNumber(orderNumber);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        bookingRepo.save(booking);

        // Initiate payment
        createPaymentOrder(req.getBookerId(), orderNumber, costume.getRentalPrice());

        return booking;
    }

    @Override
    @Transactional
    public Map<String, String> handlePaymentCallback(PaymentCallbackRequest callback) {
        CostumeBooking booking = bookingRepo.findByOrderNumber(callback.getOrderNumber())
                .orElseThrow(() -> new RuntimeException("No booking for order: " + callback.getOrderNumber()));

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT)
            return Map.of("message", "Already processed. Status: " + booking.getStatus());

        if ("SUCCESS".equalsIgnoreCase(callback.getStatus())) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaymentTransactionId(callback.getTransactionId());
            bookingRepo.save(booking);

            // Decrement available quantity
            Long bookedCostumeId = Objects.requireNonNull(booking.getCostumeId(), "booking costume id is required");
            costumeRepo.findById(bookedCostumeId).ifPresent(c -> {
                c.setAvailableQuantity(Math.max(0, c.getAvailableQuantity() - 1));
                costumeRepo.save(c);
            });

            return Map.of("status", "CONFIRMED", "orderNumber", callback.getOrderNumber());
        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepo.save(booking);
            return Map.of("status", "CANCELLED", "orderNumber", callback.getOrderNumber());
        }
    }

    @Override
    @Transactional
    public CostumeBooking confirmPickup(Long bookingId, String conditionImageUrl) {
        Long safeBookingId = Objects.requireNonNull(bookingId, "booking id is required");
        CostumeBooking booking = bookingRepo.findById(safeBookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (booking.getStatus() != BookingStatus.CONFIRMED)
            throw new RuntimeException("Booking must be CONFIRMED before pickup");
        booking.setStatus(BookingStatus.PICKED_UP);
        booking.setPickupConditionImageUrl(conditionImageUrl);
        return bookingRepo.save(booking);
    }

    @Override
    @Transactional
    public CostumeBooking confirmReturn(Long bookingId) {
        Long safeBookingId = Objects.requireNonNull(bookingId, "booking id is required");
        CostumeBooking booking = bookingRepo.findById(safeBookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (booking.getStatus() != BookingStatus.PICKED_UP)
            throw new RuntimeException("Booking must be in PICKED_UP state to return");
        booking.setStatus(BookingStatus.RETURNED);
        bookingRepo.save(booking);

        // Restore available quantity
        Long bookedCostumeId = Objects.requireNonNull(booking.getCostumeId(), "booking costume id is required");
        costumeRepo.findById(bookedCostumeId).ifPresent(c -> {
            c.setAvailableQuantity(c.getAvailableQuantity() + 1);
            costumeRepo.save(c);
        });

        return booking;
    }

    @Override
    public List<CostumeBooking> getBookingsByBooker(Long bookerId, String bookerType) {
        return bookingRepo.findByBookerIdAndBookerType(bookerId, normalizeBookerType(bookerType));
    }

    @Override
    public List<CostumeBooking> getAllBookings() {
        return bookingRepo.findAllByOrderByCreatedAtDesc();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void mapRequest(CostumeRequest req, Costume c) {
        c.setName(req.getName());
        c.setDescription(req.getDescription());
        c.setCategory(req.getCategory());
        c.setSize(req.getSize());
        c.setRentalPrice(req.getRentalPrice());
        c.setTotalQuantity(req.getTotalQuantity());
        c.setImageUrl(req.getImageUrl());
    }

    private void createPaymentOrder(Long bookerId, String orderNumber, java.math.BigDecimal amount) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customerId",    bookerId);
        body.put("orderNumber",   orderNumber);
        body.put("amount",        amount);
        body.put("currency",      "INR");
        body.put("paymentMethod", "UPI");
        body.put("purpose",       "COSTUME_RENTAL");
        body.put("callbackUrl",   selfUrl + "/api/public/costumes/payment-callback");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.postForEntity(paymentServiceUrl + "/api/payments/order",
                    new HttpEntity<>(body, headers), Map.class);
        } catch (RestClientException e) {
            log.error("Payment service error for costume booking {}: {}", orderNumber, e.getMessage());
            throw new RuntimeException("Payment service error: " + e.getMessage());
        }
    }

    private String normalizeBookerType(String rawType) {
        String normalized = rawType == null ? "" : rawType.trim().toUpperCase();
        if (!Set.of("MEMBER", "VISITOR", "TRAINER").contains(normalized)) {
            throw new RuntimeException("bookerType must be one of MEMBER, VISITOR, TRAINER");
        }
        return normalized;
    }

    private String normalizeSelectedSize(String rawSize) {
        String normalized = rawSize == null ? "" : rawSize.trim().toUpperCase();
        if (normalized.isBlank()) {
            throw new RuntimeException("Please select costume size");
        }
        return normalized;
    }

    private void validateSelectedSize(Costume costume, String selectedSize) {
        String configuredSize = costume.getSize() == null ? "" : costume.getSize().trim();
        if (configuredSize.isBlank()) {
            return;
        }

        // Costume size may be stored as a single size or a delimited list like "S,M,L".
        Set<String> allowed = Arrays.stream(configuredSize.toUpperCase().split("[,/|]"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());
        if (allowed.isEmpty()) {
            allowed = Set.of(configuredSize.toUpperCase());
        }

        if (!allowed.contains(selectedSize.toUpperCase())) {
            throw new RuntimeException("Selected size is not available for this costume");
        }
    }
}
