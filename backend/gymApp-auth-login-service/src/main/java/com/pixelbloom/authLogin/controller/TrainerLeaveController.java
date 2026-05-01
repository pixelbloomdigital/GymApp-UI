package com.pixelbloom.authLogin.controller;

import com.pixelbloom.authLogin.config.JwtAuthenticationFilter;
import com.pixelbloom.authLogin.entity.Member;
import com.pixelbloom.authLogin.entity.TrainerLeave;
import com.pixelbloom.authLogin.repository.MemberRepository;
import com.pixelbloom.authLogin.repository.TrainerLeaveRepository;
import com.pixelbloom.authLogin.requestdto.LeaveRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class TrainerLeaveController {

    private final TrainerLeaveRepository leaveRepo;
    private final MemberRepository memberRepo;

    /** Trainer applies for leave */
    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<TrainerLeave> applyLeave(
            @RequestBody LeaveRequest req,
            HttpServletRequest request) {

        Long trainerId = (Long) request.getAttribute("memberId");
        if (trainerId == null) return ResponseEntity.status(401).build();

        if (req.getFromDate() == null || req.getToDate() == null || req.getReason() == null || req.getReason().isBlank())
            return ResponseEntity.badRequest().build();

        if (req.getToDate().isBefore(req.getFromDate()))
            return ResponseEntity.badRequest().build();

        String name = memberRepo.findById(trainerId)
                .map(Member::getName).orElse("Trainer #" + trainerId);

        TrainerLeave leave = new TrainerLeave();
        leave.setTrainerId(trainerId);
        leave.setTrainerName(name);
        leave.setFromDate(req.getFromDate());
        leave.setToDate(req.getToDate());
        leave.setReason(req.getReason());
        leave.setStatus("PENDING");

        return ResponseEntity.ok(leaveRepo.save(leave));
    }

    /** Trainer views their own leaves */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<List<TrainerLeave>> myLeaves(HttpServletRequest request) {
        Long trainerId = (Long) request.getAttribute("memberId");
        if (trainerId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(leaveRepo.findByTrainerIdOrderByAppliedAtDesc(trainerId));
    }

    /** Admin views all leave requests */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrainerLeave>> allLeaves(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank())
            return ResponseEntity.ok(leaveRepo.findByStatusOrderByAppliedAtDesc(status.toUpperCase()));
        return ResponseEntity.ok(leaveRepo.findAllByOrderByAppliedAtDesc());
    }

    /** Admin approves a leave */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerLeave> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {

        TrainerLeave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found: " + id));
        Long adminId = (Long) request.getAttribute("memberId");
        leave.setStatus("APPROVED");
        leave.setReviewedBy(adminId);
        if (body != null && body.get("remark") != null) leave.setAdminRemark(body.get("remark"));
        return ResponseEntity.ok(leaveRepo.save(leave));
    }

    /** Admin rejects a leave */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainerLeave> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request) {

        TrainerLeave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found: " + id));
        Long adminId = (Long) request.getAttribute("memberId");
        leave.setStatus("REJECTED");
        leave.setReviewedBy(adminId);
        if (body != null && body.get("remark") != null) leave.setAdminRemark(body.get("remark"));
        return ResponseEntity.ok(leaveRepo.save(leave));
    }

    /** Admin or trainer deletes a PENDING leave */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        TrainerLeave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found: " + id));
        Long callerId = (Long) request.getAttribute("memberId");
        String role = (String) request.getAttribute("role");
        // Trainer can only delete their own pending leaves
        if (!"ADMIN".equalsIgnoreCase(role) && !leave.getTrainerId().equals(callerId))
            return ResponseEntity.status(403).build();
        leaveRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
