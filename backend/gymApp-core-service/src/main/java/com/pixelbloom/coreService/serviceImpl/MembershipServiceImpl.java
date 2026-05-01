package com.pixelbloom.coreService.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.pixelbloom.coreService.enums.MembershipStatus;
import com.pixelbloom.coreService.event.RenewalReminderEvent;
import com.pixelbloom.coreService.event.WelcomeEvent;
import com.pixelbloom.coreService.exception.BusinessRuleException;
import com.pixelbloom.coreService.exception.MemberNotFoundException;
import com.pixelbloom.coreService.model.memberModel.Member;
import com.pixelbloom.coreService.model.membershipModel.Batch;
import com.pixelbloom.coreService.model.membershipModel.MemberMembership;
import com.pixelbloom.coreService.model.membershipModel.MembershipPlan;
import com.pixelbloom.coreService.repository.BatchRepository;
import com.pixelbloom.coreService.repository.CustomerRepository;
import com.pixelbloom.coreService.repository.MemberMembershipRepository;
import com.pixelbloom.coreService.repository.MembershipPlanRepository;
import com.pixelbloom.coreService.requestDto.AssignMembershipRequest;
import com.pixelbloom.coreService.requestDto.PaymentCallbackRequest;
import com.pixelbloom.coreService.requestDto.RenewMembershipRequest;
import com.pixelbloom.coreService.responseDto.MembershipResponse;
import com.pixelbloom.coreService.service.KafkaProducerService;
import com.pixelbloom.coreService.service.MembershipService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

    private final MemberMembershipRepository membershipRepo;
    private final MembershipPlanRepository planRepo;
    private final BatchRepository batchRepo;
    private final RestTemplate restTemplate;
    private final CustomerRepository customerRepository;
    private final KafkaProducerService kafkaProducerService;

    @Value("${payment.service.url:http://localhost:9096}")
    private String paymentServiceUrl;

    @Value("${app.self.url:http://localhost:9099}")
    private String selfUrl;

    // ─── Assign Membership (Admin) ────────────────────────────────────────────

    @Override
    @Transactional
    public MembershipResponse assignMembership(AssignMembershipRequest request) {
        MembershipPlan plan = planRepo.findById(request.getPlanId())
                .orElseThrow(() -> new MemberNotFoundException("Plan not found: " + request.getPlanId()));
        if (!plan.getIsActive()) throw new BusinessRuleException("Plan is inactive");

        Batch batch = batchRepo.findById(request.getBatchId())
                .orElseThrow(() -> new MemberNotFoundException("Batch not found: " + request.getBatchId()));
        if (!batch.getIsActive()) throw new BusinessRuleException("Batch is inactive");
        if (batch.getCurrentEnrollment() >= batch.getCapacity())
            throw new BusinessRuleException("Batch '" + batch.getName() + "' is at full capacity");

        if (membershipRepo.existsByMemberIdAndStatus(request.getMemberId(), MembershipStatus.ACTIVE))
            throw new BusinessRuleException("Member already has an active membership");

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate   = startDate.plusMonths(plan.getDurationMonths());

        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (System.currentTimeMillis() % 100000);

        MemberMembership membership = new MemberMembership();
        membership.setMemberId(request.getMemberId());
        membership.setPlanId(plan.getId());
        membership.setBatchId(batch.getId());
        membership.setStartDate(startDate);
        membership.setEndDate(endDate);
        membership.setStatus(MembershipStatus.ACTIVE);  // Set to ACTIVE for admin assignments
        membership.setOrderNumber(orderNumber);
        membership.setPaidAmount(plan.getPrice());  // Set paid amount
        membership.setPaymentTransactionId("ADMIN-" + orderNumber);  // Dummy transaction ID
        membership.setAssignedBy(request.getAssignedBy());
        membershipRepo.save(membership);

        // Increment batch enrollment
        batch.setCurrentEnrollment(batch.getCurrentEnrollment() + 1);
        batchRepo.save(batch);

        // Publish welcome event
        Member member = customerRepository.findById(request.getMemberId())
                .orElseThrow(() -> new MemberNotFoundException("Member not found: " + request.getMemberId()));
        WelcomeEvent welcomeEvent = new WelcomeEvent(
                member.getId(),
                membership.getId(),
                member.getName(),
                member.getEmail(),
                member.getPhone(),
                plan.getName(),
                membership.getStartDate(),
                membership.getEndDate(),
                batch.getName(),
                batch.getTimeSlot(),
                plan.getPrice().doubleValue(),
                membership.getOrderNumber(),
                null, null, null, null   // diet fields
        );
        kafkaProducerService.publishWelcomeEvent(welcomeEvent);

        MembershipResponse response = toResponse(membership, plan, batch);
        response.setPaymentUrl(null);  // No payment for admin assignments
        return response;
    }

    // ─── Renew Membership (Member/Admin) ─────────────────────────────────────

    @Override
    @Transactional
    public MembershipResponse renewMembership(Long membershipId, RenewMembershipRequest request) {
        MemberMembership current = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found: " + membershipId));

        if (current.getStatus() != MembershipStatus.ACTIVE && current.getStatus() != MembershipStatus.EXPIRED)
            throw new RuntimeException("Can only renew ACTIVE or EXPIRED memberships");

        MembershipPlan plan = planRepo.findById(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found: " + request.getPlanId()));
        Batch batch = batchRepo.findById(request.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found: " + request.getBatchId()));
        if (batch.getCurrentEnrollment() >= batch.getCapacity())
            throw new RuntimeException("Batch is at full capacity");

        // New membership starts day after current ends (or today if already expired)
        LocalDate startDate = current.getEndDate() != null && current.getEndDate().isAfter(LocalDate.now())
                ? current.getEndDate().plusDays(1)
                : LocalDate.now();
        LocalDate endDate = startDate.plusMonths(plan.getDurationMonths());

        String orderNumber = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + (System.currentTimeMillis() % 100000);

        MemberMembership renewal = new MemberMembership();
        renewal.setMemberId(current.getMemberId());
        renewal.setPlanId(plan.getId());
        renewal.setBatchId(batch.getId());
        renewal.setStartDate(startDate);
        renewal.setEndDate(endDate);
        renewal.setStatus(MembershipStatus.PENDING_PAYMENT);
        renewal.setOrderNumber(orderNumber);
        membershipRepo.save(renewal);

        String paymentUrl = createPaymentOrder(current.getMemberId(), orderNumber, plan.getPrice());

        MembershipResponse response = toResponse(renewal, plan, batch);
        response.setPaymentUrl(paymentUrl);
        return response;
    }

    // ─── Payment Callback (from payment-service) ──────────────────────────────

    @Override
    @Transactional
    public Map<String, String> handlePaymentCallback(PaymentCallbackRequest callback) {
        MemberMembership membership = membershipRepo.findByOrderNumber(callback.getOrderNumber())
                .orElseThrow(() -> new RuntimeException("No membership for order: " + callback.getOrderNumber()));

        if (membership.getStatus() != MembershipStatus.PENDING_PAYMENT)
            return Map.of("message", "Already processed. Status: " + membership.getStatus());

        if ("SUCCESS".equalsIgnoreCase(callback.getStatus())) {
            membership.setStatus(MembershipStatus.ACTIVE);
            membership.setPaymentTransactionId(callback.getTransactionId());
            membership.setPaidAmount(callback.getAmount());
            membershipRepo.save(membership);

            // Increment batch enrollment
            batchRepo.findById(membership.getBatchId()).ifPresent(batch -> {
                batch.setCurrentEnrollment(batch.getCurrentEnrollment() + 1);
                batchRepo.save(batch);
            });

            log.info("Membership ACTIVATED: id={} member={} order={}",
                    membership.getId(), membership.getMemberId(), callback.getOrderNumber());

            // Publish WelcomeEvent to Kafka
            customerRepository.findById(membership.getMemberId()).ifPresentOrElse(member -> {
                String planName = planRepo.findById(membership.getPlanId())
                        .map(MembershipPlan::getName).orElse(null);
                Batch batch = batchRepo.findById(membership.getBatchId()).orElse(null);
                String batchName = batch != null ? batch.getName() : null;
                String timeSlot  = batch != null ? batch.getTimeSlot() : null;

                WelcomeEvent welcomeEvent = new WelcomeEvent(
                        member.getId(),
                        membership.getId(),
                        member.getName(),
                        member.getEmail(),
                        member.getPhone(),
                        planName,
                        membership.getStartDate(),
                        membership.getEndDate(),
                        batchName,
                        timeSlot,
                        membership.getPaidAmount() != null ? membership.getPaidAmount().doubleValue() : null,
                        membership.getOrderNumber(),
                        null, null, null, null   // dietPlanName, dietStartDate, dietEndDate, goalDetails
                );
                kafkaProducerService.publishWelcomeEvent(welcomeEvent);
            }, () -> log.error("Member not found for memberId={} orderNumber={} — WelcomeEvent NOT published",
                    membership.getMemberId(), callback.getOrderNumber()));

            return Map.of(
                    "status",        "ACTIVATED",
                    "membershipId",  String.valueOf(membership.getId()),
                    "orderNumber",   callback.getOrderNumber(),
                    "transactionId", callback.getTransactionId() != null ? callback.getTransactionId() : "");
        } else {
            membership.setStatus(MembershipStatus.CANCELLED);
            membershipRepo.save(membership);
            log.warn("Membership payment FAILED: order={}", callback.getOrderNumber());
            return Map.of("status", "CANCELLED", "orderNumber", callback.getOrderNumber());
        }
    }

    // ─── Query ────────────────────────────────────────────────────────────────

    @Override
    public List<MembershipResponse> getMemberMemberships(Long memberId) {
        return membershipRepo.findByMemberId(memberId).stream()
                .map(m -> {
                    MembershipPlan plan = planRepo.findById(m.getPlanId()).orElse(null);
                    Batch batch = batchRepo.findById(m.getBatchId()).orElse(null);
                    return toResponse(m, plan, batch);
                })
                .collect(Collectors.toList());
    }

    @Override
    public MembershipResponse getMembershipById(Long membershipId) {
        MemberMembership m = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found: " + membershipId));
        MembershipPlan plan = planRepo.findById(m.getPlanId()).orElse(null);
        Batch batch = batchRepo.findById(m.getBatchId()).orElse(null);
        return toResponse(m, plan, batch);
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MembershipResponse cancelMembership(Long membershipId) {
        MemberMembership membership = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found: " + membershipId));

        if (membership.getStatus() == MembershipStatus.ACTIVE) {
            batchRepo.findById(membership.getBatchId()).ifPresent(batch -> {
                batch.setCurrentEnrollment(Math.max(0, batch.getCurrentEnrollment() - 1));
                batchRepo.save(batch);
            });
        }

        membership.setStatus(MembershipStatus.CANCELLED);
        membershipRepo.save(membership);

        MembershipPlan plan = planRepo.findById(membership.getPlanId()).orElse(null);
        Batch batch = batchRepo.findById(membership.getBatchId()).orElse(null);
        return toResponse(membership, plan, batch);
    }

    // ─── Scheduled: Expire memberships daily at midnight ─────────────────────

    @Override
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public int expireMemberships() {
        List<MemberMembership> expired = membershipRepo
                .findByStatusAndEndDateBefore(MembershipStatus.ACTIVE, LocalDate.now());

        expired.forEach(m -> {
            m.setStatus(MembershipStatus.EXPIRED);
            membershipRepo.save(m);
            batchRepo.findById(m.getBatchId()).ifPresent(batch -> {
                batch.setCurrentEnrollment(Math.max(0, batch.getCurrentEnrollment() - 1));
                batchRepo.save(batch);
            });
        });

        log.info("Expired {} memberships", expired.size());
        return expired.size();
    }

    // ─── Scheduled: Renewal reminders daily at 9 AM ──────────────────────────

    @Scheduled(cron = "0 0 9 * * *")
    public void sendRenewalReminders() {
        List<MemberMembership> expiring = membershipRepo
                .findByStatusAndEndDate(MembershipStatus.ACTIVE, LocalDate.now().plusDays(2));

        expiring.forEach(m -> {
            customerRepository.findById(m.getMemberId()).ifPresentOrElse(member -> {
                String planName  = planRepo.findById(m.getPlanId())
                        .map(MembershipPlan::getName).orElse(null);
                String batchName = batchRepo.findById(m.getBatchId())
                        .map(Batch::getName).orElse(null);

                RenewalReminderEvent event = new RenewalReminderEvent(
                        member.getId(),
                        m.getId(),
                        member.getName(),
                        member.getEmail(),
                        member.getPhone(),
                        planName,
                        m.getEndDate(),
                        batchName
                );
                kafkaProducerService.publishRenewalReminderEvent(event);
            }, () -> log.error("Member not found for memberId={} membershipId={} — RenewalReminderEvent NOT published",
                    m.getMemberId(), m.getId()));
        });
    }

    // ─── Payment-service call ─────────────────────────────────────────────────

    private String createPaymentOrder(Long memberId, String orderNumber, BigDecimal amount) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customerId",   memberId);
        body.put("orderNumber",  orderNumber);
        body.put("amount",       amount);
        body.put("currency",     "INR");
        body.put("paymentMethod","UPI");
        body.put("purpose",      "MEMBERSHIP");
        body.put("callbackUrl",  selfUrl + "/api/payments/callback");

        String url = paymentServiceUrl + "/api/payments/order";
        log.info("Calling payment-service: POST {} for order {}", url, orderNumber);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            var response = restTemplate.postForEntity(url,
                    new HttpEntity<>(body, headers), Map.class);

            if (response.getBody() != null && response.getBody().containsKey("paymentUrl")) {
                return (String) response.getBody().get("paymentUrl");
            }
            throw new RuntimeException("Payment service returned no paymentUrl: " + response.getBody());
        } catch (Exception e) {
            log.error("Payment service error: {}", e.getMessage());
            throw new RuntimeException("Payment service error: " + e.getMessage());
        }
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private MembershipResponse toResponse(MemberMembership m, MembershipPlan plan, Batch batch) {
        MembershipResponse r = new MembershipResponse();
        r.setMembershipId(m.getId());
        r.setMemberId(m.getMemberId());
        r.setOrderNumber(m.getOrderNumber());
        r.setStartDate(m.getStartDate());
        r.setEndDate(m.getEndDate());
        r.setStatus(m.getStatus());
        r.setPaidAmount(m.getPaidAmount());
        r.setPaymentTransactionId(m.getPaymentTransactionId());
        r.setCreatedAt(m.getCreatedAt());

        if (plan != null) {
            r.setPlanName(plan.getName());
            r.setDurationMonths(plan.getDurationMonths());
            r.setPlanPrice(plan.getPrice());
        }
        if (batch != null) {
            r.setBatchName(batch.getName());
            r.setBatchTimeSlot(batch.getTimeSlot());
        }
        if (m.getEndDate() != null && m.getStatus() == MembershipStatus.ACTIVE) {
            r.setDaysRemaining(ChronoUnit.DAYS.between(LocalDate.now(), m.getEndDate()));
        }
        return r;
    }
}
