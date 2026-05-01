package com.pixelbloom.authLogin.serviceImpl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.authLogin.entity.*;
import com.pixelbloom.authLogin.enums.AuthProviderType;
import com.pixelbloom.authLogin.enums.MemberStatus;
import com.pixelbloom.authLogin.enums.Role;
import com.pixelbloom.authLogin.event.MemberCreatedEvent;
import com.pixelbloom.authLogin.jwt.JwtService;
import com.pixelbloom.authLogin.repository.*;
import com.pixelbloom.authLogin.repository.VisitorNotificationRepository;
import com.pixelbloom.authLogin.requestdto.*;
import com.pixelbloom.authLogin.requestdto.TrainerRegisterRequest;
import com.pixelbloom.authLogin.responsedto.*;
import com.pixelbloom.authLogin.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final VisitorRepository visitorRepo;
    private final MemberRepository memberRepo;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder;
    private final CouponRepository couponRepo;
    private final OtpRepository otpRepo;
    private final DemoSlotRepository demoSlotRepo;
    private final DemoBookingRepository demoBookingRepo;
    private final VisitorNotificationRepository notificationRepo;
    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String MEMBER_CREATED_TOPIC = "gym.member.created";

    @Override
    public VisitorRegisterResponse registerVisitor(VisitorRegisterRequest request) {
        if (memberRepo.findByEmail(request.email).isPresent()) {
            throw new com.pixelbloom.authLogin.exception.DuplicateEmailException(request.email);
        }
        try {
            boolean hasPassword = request.password != null && !request.password.isBlank();
            String rawPassword = hasPassword ? request.password : null;

            // Save into member table with VISITOR role so unified login works
            Member m = new Member();
            m.setName(request.name);
            m.setEmail(request.email);
            m.setPhone(request.phone);
            m.setGymCenter(request.gymCenter);
            m.setPassword(rawPassword != null ? encoder.encode(rawPassword) : null);
            m.setRole(Role.VISITOR);
            m.setMemberStatus(MemberStatus.INACTIVE);
            m.setProviderType(AuthProviderType.EMAIL);
            memberRepo.save(m);

            // Also save into visitor table for demo booking (needs visitorId)
            Visitor v = new Visitor();
            v.setName(request.name);
            v.setEmail(request.email);
            v.setPhone(request.phone);
            v.setGymCenter(request.gymCenter);
            v.setCity(request.city);
            v.setState(request.state);
            v.setPreferredBatchesJson(request.preferredBatches != null ? objectMapper.writeValueAsString(request.preferredBatches) : null);
            v.setInterestedMembershipPlanId(request.interestedMembershipPlanId);
            v.setInquirySource(request.inquirySource);
            v.setDemoDatePreference(request.demoDatePreference);
            v.setDemoTimeSlotPreference(request.demoTimeSlotPreference);
            v.setEventInterestJson(objectMapper.writeValueAsString(request.eventInterest));
            v.setCostumeInterest(request.costumeInterest);
            v.setVisitDate(LocalDate.now());
            v.setRole(Role.VISITOR);
            v.setPassword(m.getPassword()); // same encoded password
            v.setProviderType(AuthProviderType.EMAIL);
            visitorRepo.save(v);

                String smsMessage = hasPassword
                    ? "Welcome to MuscleFit, " + request.name + ". Your login is " + request.email + " and your password is " + rawPassword + "."
                    : "Welcome to MuscleFit, " + request.name + ". Your account is ready. Use Forgot Password with your phone number to set a password and login.";
                sendSms(request.phone, smsMessage);

            return VisitorRegisterResponse.builder()
                    .visitorId(m.getMemberId()) // use memberId as the canonical id
                    .status("VISITOR")
                    .name(m.getName())
                    .email(m.getEmail())
                    .phone(m.getPhone())
                    .gymCenter(m.getGymCenter())
                    .preferredBatches(request.preferredBatches != null ? request.preferredBatches : new ArrayList<BatchType>())
                    .interestedMembershipPlanId(request.interestedMembershipPlanId)
                    .demoDatePreference(request.demoDatePreference)
                    .demoTimeSlotPreference(request.demoTimeSlotPreference)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public CreateMemberResponse convertVisitorToMember(CreateMemberRequest request) {
        Visitor v = visitorRepo.findById(request.visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + request.visitorId));
        if (memberRepo.findByEmail(v.getEmail()).isPresent()) {
            throw new RuntimeException("Member already exists with email: " + v.getEmail());
        }

        Member m = new Member();
        m.setName(v.getName());
        m.setEmail(v.getEmail());
        m.setPhone(v.getPhone());
        m.setPassword(encoder.encode(request.password));
        m.setGymCenter(request.gymCenter);
        m.setRole(Role.MEMBER);
        m.setMemberStatus(MemberStatus.INACTIVE); // Active only after membership purchase
        m.setProviderType(AuthProviderType.EMAIL);
        memberRepo.save(m);

        // Sync member to gym_customersdb via Kafka so core-service can look it up
        kafkaTemplate.send(MEMBER_CREATED_TOPIC, String.valueOf(m.getMemberId()),
                new MemberCreatedEvent(m.getMemberId(), m.getName(), m.getEmail(), m.getPhone()));

        // Parse preferred batches from visitor JSON to return to caller
        List<BatchType> preferredBatches = new java.util.ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            if (v.getPreferredBatchesJson() != null) {
                preferredBatches = mapper.readValue(
                    v.getPreferredBatchesJson(),
                    mapper.getTypeFactory().constructCollectionType(List.class, BatchType.class));
            }
        } catch (Exception ignored) {}

        visitorRepo.delete(v);

        return CreateMemberResponse.builder()
                .memberId(m.getMemberId())
                .name(m.getName())
                .email(m.getEmail())
                .phone(m.getPhone())
                .gymCenter(m.getGymCenter())
                .role(m.getRole().name())
                .memberStatus(m.getMemberStatus().name())
                .preferredBatches(preferredBatches)
                .joinedAt(m.getJoinedAt())
                .message("Member created successfully. Status will become ACTIVE after membership purchase.")
                .build();
    }

    @Override
    public void updateMemberStatus(Long memberId, MemberStatus status) {
        int updated = memberRepo.updateMemberStatus(memberId, status);
        if (updated == 0) throw new RuntimeException("Member not found: " + memberId);
    }

    @Override
    public void changeMemberRole(Long memberId, com.pixelbloom.authLogin.enums.Role role, Long visitorId) {
        Member m = memberRepo.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
        m.setRole(role);
        if (role == com.pixelbloom.authLogin.enums.Role.MEMBER) {
            m.setMemberStatus(MemberStatus.ACTIVE);
        }
        memberRepo.save(m);

        if (role == com.pixelbloom.authLogin.enums.Role.MEMBER) {
            java.util.Optional<Visitor> visitorOpt = java.util.Optional.empty();
            if (visitorId != null) {
                visitorOpt = visitorRepo.findById(visitorId);
            }
            if (visitorOpt.isEmpty()) {
                visitorOpt = visitorRepo.findByEmail(m.getEmail());
            }
            visitorOpt.ifPresent(v -> {
                v.setRole(Role.MEMBER);
                visitorRepo.save(v);
                String message = "Congratulations! You have been promoted to a MuscleFit member. Welcome aboard!";
                addVisitorNotification(v.getVisitorId(), message, "MEMBERSHIP");
                sendSms(v.getPhone(), message);
            });
        }
    }

    @Override
    public Long getMemberIdByVisitorId(Long visitorId) {
        Visitor visitor = visitorRepo.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + visitorId));
        Member member = memberRepo.findByEmail(visitor.getEmail())
                .orElseThrow(() -> new RuntimeException("Member not found for visitor email: " + visitor.getEmail()));
        return member.getMemberId();
    }

    private void sendSms(String phone, String message) {
        if (phone == null || phone.isBlank() || twilioAccountSid == null || twilioAccountSid.isBlank()
                || twilioAuthToken == null || twilioAuthToken.isBlank() || twilioSmsFrom == null || twilioSmsFrom.isBlank()) {
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
            System.err.println("Twilio SMS failed for " + phone + ": " + e.getMessage());
        }
    }

    @Override
    public void markVisitorAttended(Long visitorId) {
        Visitor v = visitorRepo.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + visitorId));
        v.setVisitedAt(LocalDateTime.now());
        visitorRepo.save(v);
    }

    @Override
    public void registerAdmin(AdminRegisterRequest request) {
        if (memberRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }
        Member m = new Member();
        m.setName(request.getName());
        m.setPhone(request.getPhone());
        m.setEmail(request.getEmail());
        m.setPassword(encoder.encode(request.getPassword()));
        m.setRole(Role.ADMIN);
        m.setGymCenter(request.gymCenter);
        m.setProviderType(AuthProviderType.EMAIL);
        memberRepo.save(m);
    }

    @Override
    public void registerMember(MemberRegisterRequest request) {
        if (memberRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        boolean hasAdminPassword = request.getPassword() != null && !request.getPassword().isBlank();
        String rawPassword = hasAdminPassword
            ? request.getPassword()
            : "Temp@" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);

        Member m = new Member();
        m.setName(request.getName());
        m.setPhone(request.getPhone());
        m.setEmail(request.getEmail());
        m.setPassword(encoder.encode(rawPassword));
        m.setRole(Role.MEMBER);
        m.setGymCenter(request.getGymCenter());
        m.setMemberStatus(MemberStatus.ACTIVE);
        m.setProviderType(AuthProviderType.EMAIL);
        memberRepo.save(m);

        String smsMessage = hasAdminPassword
            ? "Welcome to MuscleFit, " + request.getName() + ". Your login is " + request.getEmail() + " and your password is " + rawPassword + "."
            : "Welcome to MuscleFit, " + request.getName() + ". Your account is ready. Use Forgot Password with your phone number to set a password and login.";
        sendSms(request.getPhone(), smsMessage);
    }

    @Override
    public Long registerTrainer(TrainerRegisterRequest request) {
        if (memberRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }
        boolean hasPassword = request.getPassword() != null && !request.getPassword().isBlank();
        String rawPassword = hasPassword ? request.getPassword() : null;

        Member m = new Member();
        m.setName(request.getName());
        m.setPhone(request.getPhone());
        m.setEmail(request.getEmail());
        m.setPassword(rawPassword != null ? encoder.encode(rawPassword) : null);
        m.setRole(Role.TRAINER);
        m.setGymCenter(request.getGymCenter());
        m.setProviderType(AuthProviderType.EMAIL);
        memberRepo.save(m);

        String smsMessage = hasPassword
            ? "Welcome to MuscleFit, " + request.getName() + ". Your trainer login is " + request.getEmail() + " and your password is " + rawPassword + "."
            : "Welcome to MuscleFit, " + request.getName() + ". Your trainer account is ready. Use Forgot Password with your phone number to set a password and login.";
        sendSms(request.getPhone(), smsMessage);
        return m.getMemberId();
    }

    @Override
    public LoginResponse memberLogin(LoginRequest request) {
        Member m = memberRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found for: " + request.getEmail()));

        if (!encoder.matches(request.getPassword(), m.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(m.getMemberId(), m.getEmail(), m.getRole().name());
        return new LoginResponse(m.getMemberId(), m.getEmail(), m.getName(), m.getRole().name(), token);
    }

    @Override
    public VisitorResponse vistorLogin(LoginRequest request) {
        Visitor v = visitorRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No account found for: " + request.getEmail()
                ));
        if (!encoder.matches(request.getPassword(), v.getPassword()))
            throw new RuntimeException("Invalid password");
        String token = jwtService.generateToken(v.getVisitorId(), v.getEmail(), v.getRole().name());
        return new VisitorResponse(v.getVisitorId(), v.getEmail(), v.getName(), v.getRole().name(), token);
    }

    @Override
    public Map<String, Object> unifiedLogin(LoginRequest request) {
        Member m = memberRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found for: " + request.getEmail()));
        if (!encoder.matches(request.getPassword(), m.getPassword()))
            throw new RuntimeException("Invalid password");
        String token = jwtService.generateToken(m.getMemberId(), m.getEmail(), m.getRole().name());
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id",       m.getMemberId());
        res.put("memberId", m.getMemberId());
        res.put("name",     m.getName());
        res.put("email",    m.getEmail());
        res.put("role",     m.getRole().name());
        res.put("token",    token);
        // include visitorId if VISITOR role (needed for demo booking)
        if (m.getRole() == Role.VISITOR) {
            visitorRepo.findByEmail(m.getEmail())
                .ifPresent(v -> res.put("visitorId", v.getVisitorId()));
        }
        return res;
    }

    @Override
    public BookDemoResponse bookDemo(BookDemoRequest request) {
        final double DEMO_PRICE = 100.0;
        visitorRepo.findById(request.visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + request.visitorId));

        DemoSlot slot = demoSlotRepo.findByBatchTypeAndSlotType(request.batchType, request.slotType)
                .orElseThrow(() -> new RuntimeException("Slot not found for: " + request.batchType + " " + request.slotType));

        if (slot.getBookedCount() >= slot.getCapacity())
            throw new RuntimeException("Slot is fully booked: " + request.batchType + " " + request.slotType);

        if (demoBookingRepo.existsByVisitorIdAndSlotId(request.visitorId, slot.getSlotId()))
            throw new RuntimeException("Already booked this slot");

        double discount = 0.0;
        String couponUsed = null;

        if (request.couponCode != null && !request.couponCode.isBlank()) {
            Coupon coupon = couponRepo.findByCodeAndActiveTrue(request.couponCode)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired coupon: " + request.couponCode));
            if ("FLAT".equalsIgnoreCase(coupon.getDiscountType()))
                discount = Math.min(coupon.getDiscountValue(), DEMO_PRICE);
            else if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType()))
                discount = (coupon.getDiscountValue() / 100.0) * DEMO_PRICE;
            couponUsed = coupon.getCode();
        }

        double finalAmount = Math.max(0.0, DEMO_PRICE - discount);

        DemoBooking booking = new DemoBooking();
        booking.setVisitorId(request.visitorId);
        booking.setSlotId(slot.getSlotId());
        booking.setOriginalAmount(DEMO_PRICE);
        booking.setDiscountApplied(discount);
        booking.setFinalAmount(finalAmount);
        booking.setCouponUsed(couponUsed);
        demoBookingRepo.save(booking);

        slot.setBookedCount(slot.getBookedCount() + 1);
        demoSlotRepo.save(slot);
        return new BookDemoResponse(
                request.visitorId,
                slot.getBatchType().name(), slot.getSlotType().name(),
                slot.getStartTime() + " - " + slot.getEndTime(),
                DEMO_PRICE, discount, finalAmount, couponUsed,
                finalAmount == 0.0 ? "Demo booked for free!" : "Demo booked for Rs. " + finalAmount
        );
    }

    @Override
    public List<DemoSlot> getAvailableSlots() {
        return demoSlotRepo.findAllByOrderByBatchTypeAscSlotTypeAsc();
    }

    @Override
    public List<Visitor> getVisitorsByDate(LocalDateTime start, LocalDateTime end) {
        return visitorRepo.findByVisitedAtBetween(start, end);
    }

    @Override
    public List<VisitorRegisterResponse> getVisitorsByName(String name) {
        List<Visitor> visitorList = visitorRepo.findByName(name);
        List<VisitorRegisterResponse> responseList = new ArrayList<>();
        for (Visitor v : visitorList) {
            List<BatchType> batches = null;
            try {
                if (v.getPreferredBatchesJson() != null) {
                    batches = objectMapper.readValue(
                            v.getPreferredBatchesJson(),
                            new TypeReference<List<BatchType>>() {});
                }
            } catch (Exception e) {
                batches = new ArrayList<>();
            }
            responseList.add(VisitorRegisterResponse.builder()
                    .visitorId(v.getVisitorId())
                    .status(v.getRole().name())
                    .name(v.getName())
                    .email(v.getEmail())
                    .phone(v.getPhone())
                    .gymCenter(v.getGymCenter())
                    .preferredBatches(batches)
                    .interestedMembershipPlanId(v.getInterestedMembershipPlanId())
                    .demoDatePreference(v.getDemoDatePreference())
                    .demoTimeSlotPreference(v.getDemoTimeSlotPreference())
                    .build());
        }
        return responseList;
    }

    @Override
    public void updateBatchPreferences(Long visitorId , VisitorRegisterRequest request) {
        visitorRepo.findById(visitorId).ifPresent(v -> {
            List<BatchType> preferredBatches = request.getPreferredBatches();
            try {
                v.setPreferredBatchesJson(objectMapper.writeValueAsString(preferredBatches));
                visitorRepo.save(v);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Override
    public List<VisitorNotificationResponse> getVisitorNotifications(Long visitorId) {
        return notificationRepo.findByVisitorIdOrderByCreatedAtDesc(visitorId).stream()
                .map(n -> VisitorNotificationResponse.builder()
                        .id(n.getId())
                        .message(n.getMessage())
                        .type(n.getType())
                        .createdAt(n.getCreatedAt())
                        .readFlag(n.isReadFlag())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void addVisitorNotification(Long visitorId, String message, String type) {
        if (visitorRepo.existsById(visitorId)) {
            VisitorNotification notification = VisitorNotification.builder()
                    .visitorId(visitorId)
                    .message(message)
                    .type(type)
                    .readFlag(false)
                    .build();
            notificationRepo.save(notification);
        }
    }

    // ─── Admin visitor management ─────────────────────────────────────────────

    @Override
    public List<VisitorAdminResponse> getAllVisitors() {
        return visitorRepo.findAll().stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VisitorAdminResponse getVisitorById(Long visitorId) {
        Visitor v = visitorRepo.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + visitorId));
        return toAdminResponse(v);
    }

    @Override
    public VisitorAdminResponse updateVisitor(Long visitorId, VisitorRegisterRequest request) {
        Visitor v = visitorRepo.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + visitorId));
        if (request.getName() != null)       v.setName(request.getName());
        if (request.getPhone() != null)      v.setPhone(request.getPhone());
        if (request.getGymCenter() != null)  v.setGymCenter(request.getGymCenter());
        if (request.getInquirySource() != null) v.setInquirySource(request.getInquirySource());
        if (request.getPreferredBatches() != null) {
            try {
                v.setPreferredBatchesJson(objectMapper.writeValueAsString(request.getPreferredBatches()));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize preferred batches", e);
            }
        }
        visitorRepo.save(v);
        return toAdminResponse(v);
    }

    @Override
    public void deleteVisitor(Long visitorId) {
        if (!visitorRepo.existsById(visitorId))
            throw new RuntimeException("Visitor not found: " + visitorId);
        visitorRepo.deleteById(visitorId);
    }

    @Override
    public List<VisitorAdminResponse> getVisitorsByGymCenter(String gymCenter) {
        return visitorRepo.findByGymCenter(gymCenter).stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getVisitorCountByDate(LocalDate date) {
        return visitorRepo.countByVisitDate(date);
    }

    private VisitorAdminResponse toAdminResponse(Visitor v) {
        List<BatchType> batches = new ArrayList<>();
        try {
            if (v.getPreferredBatchesJson() != null) {
                batches = objectMapper.readValue(
                        v.getPreferredBatchesJson(),
                        new TypeReference<List<BatchType>>() {});
            }
        } catch (Exception ignored) {}

        return VisitorAdminResponse.builder()
                .visitorId(v.getVisitorId())
                .name(v.getName())
                .email(v.getEmail())
                .phone(v.getPhone())
                .gymCenter(v.getGymCenter())
                .role(v.getRole().name())
                .providerType(v.getProviderType().name())
                .inquirySource(v.getInquirySource())
                .visitDate(v.getVisitDate())
                .visitedAt(v.getVisitedAt())
                .preferredBatches(batches)
                .demoDatePreference(v.getDemoDatePreference())
                .demoTimeSlotPreference(v.getDemoTimeSlotPreference())
                .profilePictureUrl(v.getProfilePictureUrl())
                .build();
    }


    @Override
    public java.util.List<java.util.Map<String, Object>> getAllStaff() {
        return memberRepo.findAllStaff().stream().map(m -> {
            java.util.Map<String, Object> map = new LinkedHashMap<>();
            map.put("memberId",  m.getMemberId());
            map.put("name",      m.getName());
            map.put("email",     m.getEmail());
            map.put("phone",     m.getPhone());
            map.put("role",      m.getRole().name());
            map.put("gymCenter", m.getGymCenter());
            map.put("joinedAt",  m.getJoinedAt());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void deleteStaff(Long memberId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Staff not found: " + memberId));

        if (member.getRole() != Role.ADMIN && member.getRole() != Role.TRAINER) {
            throw new RuntimeException("Only trainer/admin records can be deleted from staff section");
        }

        memberRepo.delete(member);
    }

    @Override
    public List<MemberResponse> getAllMembersWithRole(Role role) {
        return memberRepo.findByRole(role).stream()
                .map(m -> MemberResponse.builder()
                        .memberId(m.getMemberId())
                        .name(m.getName())
                        .email(m.getEmail())
                        .phone(m.getPhone())
                        .gymCenter(m.getGymCenter())
                        .joinedAt(m.getJoinedAt())
                        .role(m.getRole())
                        .memberStatus(m.getMemberStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void resetPassword(String phone, String newPassword) {
        // Try member table first
        Optional<Member> memberOpt = memberRepo.findByPhone(phone);
        if (memberOpt.isPresent()) {
            Member m = memberOpt.get();
            m.setPassword(encoder.encode(newPassword));
            memberRepo.save(m);
            return;
        }
        // Fallback to visitor table
        Visitor v = visitorRepo.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("No account found for phone: " + phone));
        v.setPassword(encoder.encode(newPassword));
        visitorRepo.save(v);
    }

    @org.springframework.beans.factory.annotation.Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @org.springframework.beans.factory.annotation.Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @org.springframework.beans.factory.annotation.Value("${twilio.sms-from:}")
    private String twilioSmsFrom;

    @Override
    public String sendOtp(OtpSendRequest request) {
        otpRepo.findByPhone(request.phone).ifPresent(otpRepo::delete);

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        OtpStore store = new OtpStore();
        store.setPhone(request.phone);
        store.setOtp(otp);
        store.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otpRepo.save(store);

        // Send SMS via Twilio if credentials are configured
        if (twilioAccountSid != null && !twilioAccountSid.isBlank()
                && twilioAuthToken != null && !twilioAuthToken.isBlank()) {
            try {
                com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
                com.twilio.rest.api.v2010.account.Message.creator(
                        new com.twilio.type.PhoneNumber("+91" + request.phone),
                        new com.twilio.type.PhoneNumber(twilioSmsFrom),
                        "Your MuscleFit OTP is: " + otp + ". Valid for 5 minutes."
                ).create();
                return "OTP sent to " + request.phone;
            } catch (Exception e) {
                // Log but don't fail — return OTP in dev mode as fallback
                System.err.println("Twilio SMS failed: " + e.getMessage());
            }
        }

        // Dev mode — return OTP in response
        return "OTP sent to " + request.phone + " [DEV ONLY: " + otp + "]";
    }

    @Override
    public LoginResponse verifyOtp(OtpVerifyRequest request) {
        OtpStore store = otpRepo.findByPhone(request.phone)
                .orElseThrow(() -> new RuntimeException("No OTP requested for: " + request.phone));

        if (store.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired for: " + request.phone);

        if (!store.getOtp().equals(request.otp))
            throw new RuntimeException("Invalid OTP");

        otpRepo.deleteByPhone(request.phone);

        // Check Member table first (MEMBER, TRAINER, ADMIN)
        Optional<Member> memberOpt = memberRepo.findByPhone(request.phone);
        if (memberOpt.isPresent()) {
            Member m = memberOpt.get();
            String token = jwtService.generateToken(m.getMemberId(), m.getEmail(), m.getRole().name());
            return new LoginResponse(m.getMemberId(), m.getEmail(), m.getName(), m.getRole().name(), token);
        }

        // Fallback to Visitor
        Visitor v = visitorRepo.findByPhone(request.phone)
                .orElseThrow(() -> new RuntimeException("No account found for phone: " + request.phone));
        String token = jwtService.generateToken(v.getVisitorId(), v.getEmail(), v.getRole().name());
        return new LoginResponse(v.getVisitorId(), v.getEmail(), v.getName(), v.getRole().name(), token);
    }


}
