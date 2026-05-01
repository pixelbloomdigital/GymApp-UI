package com.pixelbloom.authLogin.controller;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pixelbloom.authLogin.entity.Visitor;
import com.pixelbloom.authLogin.enums.MemberStatus;
import com.pixelbloom.authLogin.requestdto.LoginRequest;
import com.pixelbloom.authLogin.requestdto.OtpSendRequest;
import com.pixelbloom.authLogin.requestdto.OtpVerifyRequest;
import com.pixelbloom.authLogin.requestdto.VisitorRegisterRequest;
import com.pixelbloom.authLogin.responsedto.LoginResponse;
import com.pixelbloom.authLogin.responsedto.VisitorRegisterResponse;
import com.pixelbloom.authLogin.responsedto.VisitorResponse;
import com.pixelbloom.authLogin.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginController {

    private final AuthService service;

    @PostMapping("/member/login")
    public LoginResponse loginMember(@RequestBody LoginRequest request) {
        return service.memberLogin(request);
    }
    @PostMapping("/visitor/login")
    public VisitorResponse loginVisitor(@RequestBody LoginRequest request) {
        return service.vistorLogin(request);
    }

    /** Single unified login — checks visitor table first, then member table.
     *  Returns role so frontend can redirect accordingly. */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> unifiedLogin(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.unifiedLogin(request));
    }

    @PostMapping("/otp/send")
    public String sendOtp(@RequestBody OtpSendRequest request) {
        return service.sendOtp(request);
    }

    @PostMapping("/otp/verify")
    public LoginResponse verifyOtp(@RequestBody OtpVerifyRequest request) {
        return service.verifyOtp(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        service.resetPassword(body.get("phone"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    /** GET /api/auth/staff — Admin: list all trainers and admins */
    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getStaff() {
        return ResponseEntity.ok(service.getAllStaff());
    }

    /** DELETE /api/auth/staff/{memberId} — Admin: delete trainer/admin */
    @DeleteMapping("/staff/{memberId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long memberId) {
        service.deleteStaff(memberId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/admin/findVistorByDate/{start}/{end}")
    public List<Visitor> findVistorByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return service.getVisitorsByDate(start.atStartOfDay(), end.atTime(23, 59, 59));
    }




    @GetMapping("/admin/findVistorByName/{name}")
    public List<VisitorRegisterResponse> findVistorByName(@PathVariable String name) {
        return service.getVisitorsByName(name);
    }

    @PutMapping("/admin/updateMemberStatus/{memberId}/{status}")
    public void updateMemberStatus(@PathVariable Long memberId, @PathVariable String status) {
        service.updateMemberStatus(memberId, MemberStatus.valueOf(status));
    }

    @PutMapping("/visitor/updateBatchPref")
    public String updateBatchPreferences(@RequestParam Long visitorId, @RequestBody VisitorRegisterRequest request){
        service.updateBatchPreferences(visitorId,request);
        return "batch preferences updated successfully!!!";
    }
}