package com.pixelbloom.authLogin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.pixelbloom.authLogin.entity.DemoSlot;
import com.pixelbloom.authLogin.entity.Visitor;
import com.pixelbloom.authLogin.enums.MemberStatus;
import com.pixelbloom.authLogin.requestdto.AdminRegisterRequest;
import com.pixelbloom.authLogin.requestdto.BookDemoResponse;
import com.pixelbloom.authLogin.requestdto.CreateMemberRequest;
import com.pixelbloom.authLogin.requestdto.LoginRequest;
import com.pixelbloom.authLogin.requestdto.MemberRegisterRequest;
import com.pixelbloom.authLogin.requestdto.OtpSendRequest;
import com.pixelbloom.authLogin.requestdto.OtpVerifyRequest;
import com.pixelbloom.authLogin.requestdto.TrainerRegisterRequest;
import com.pixelbloom.authLogin.requestdto.VisitorRegisterRequest;
import com.pixelbloom.authLogin.responsedto.BookDemoRequest;
import com.pixelbloom.authLogin.responsedto.CreateMemberResponse;
import com.pixelbloom.authLogin.responsedto.LoginResponse;
import com.pixelbloom.authLogin.responsedto.MemberResponse;
import com.pixelbloom.authLogin.responsedto.VisitorAdminResponse;
import com.pixelbloom.authLogin.responsedto.VisitorNotificationResponse;
import com.pixelbloom.authLogin.responsedto.VisitorRegisterResponse;
import com.pixelbloom.authLogin.responsedto.VisitorResponse;

public interface AuthService {
    VisitorRegisterResponse registerVisitor(VisitorRegisterRequest request);
    CreateMemberResponse convertVisitorToMember(CreateMemberRequest request);
    void registerAdmin(AdminRegisterRequest request);
    void registerMember(MemberRegisterRequest request);
    Long registerTrainer(TrainerRegisterRequest request);
    LoginResponse memberLogin(LoginRequest request);
    VisitorResponse vistorLogin(LoginRequest request);
    Map<String, Object> unifiedLogin(LoginRequest request);


    /**
     * Called by gymApp-core-service (internal) once membership payment is confirmed.
     * Transitions member status: INACTIVE → ACTIVE.
     */
    void updateMemberStatus(Long memberId, MemberStatus status);
    void changeMemberRole(Long memberId, com.pixelbloom.authLogin.enums.Role role, Long visitorId);
    Long getMemberIdByVisitorId(Long visitorId);
    BookDemoResponse bookDemo(BookDemoRequest request);

    String sendOtp(OtpSendRequest request);
    LoginResponse verifyOtp(OtpVerifyRequest request);
    void resetPassword(String phone, String newPassword);
    java.util.List<java.util.Map<String, Object>> getAllStaff();
    void deleteStaff(Long memberId);
    List<MemberResponse> getAllMembersWithRole(com.pixelbloom.authLogin.enums.Role role);

    List<DemoSlot> getAvailableSlots();

    List<Visitor> getVisitorsByDate(LocalDateTime start, LocalDateTime end);

    List<VisitorRegisterResponse> getVisitorsByName(String name);

    void updateBatchPreferences(Long visitorId, VisitorRegisterRequest request);

    List<VisitorNotificationResponse> getVisitorNotifications(Long visitorId);
    void addVisitorNotification(Long visitorId, String message, String type);

    // ─── Admin visitor management ─────────────────────────────────────────────

    List<VisitorAdminResponse> getAllVisitors();

    VisitorAdminResponse getVisitorById(Long visitorId);

    VisitorAdminResponse updateVisitor(Long visitorId, VisitorRegisterRequest request);

    void deleteVisitor(Long visitorId);

    List<VisitorAdminResponse> getVisitorsByGymCenter(String gymCenter);

    long getVisitorCountByDate(LocalDate date);

    void markVisitorAttended(Long visitorId);
}
