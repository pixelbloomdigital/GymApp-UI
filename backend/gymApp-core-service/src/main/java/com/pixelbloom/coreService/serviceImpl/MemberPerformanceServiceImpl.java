package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.model.memberModel.MemberGoal;
import com.pixelbloom.coreService.model.memberModel.MemberHealthLog;
import com.pixelbloom.coreService.model.memberModel.MemberProfile;
import com.pixelbloom.coreService.repository.CustomerRepository;
import com.pixelbloom.coreService.repository.MemberGoalRepository;
import com.pixelbloom.coreService.repository.MemberHealthLogRepository;
import com.pixelbloom.coreService.repository.MemberProfileRepository;
import com.pixelbloom.coreService.requestDto.CreateGoalRequest;
import com.pixelbloom.coreService.requestDto.LogHealthMetricsRequest;
import com.pixelbloom.coreService.requestDto.UpsertMemberExtendedProfileRequest;
import com.pixelbloom.coreService.responseDto.MemberExtendedProfileResponse;
import com.pixelbloom.coreService.responseDto.MemberProgressSummary;
import com.pixelbloom.coreService.service.MemberPerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberPerformanceServiceImpl implements MemberPerformanceService {

    private final MemberHealthLogRepository healthLogRepository;
    private final MemberGoalRepository goalRepository;
    private final MemberProfileRepository profileRepository;
    private final CustomerRepository customerRepository;

    private static final DateTimeFormatter GOAL_DATE_FORMAT = DateTimeFormatter.ofPattern("MMMM yyyy");

    @Override
    @Transactional
    public MemberHealthLog logHealthMetrics(Long memberId, LogHealthMetricsRequest request) {
        MemberHealthLog log = new MemberHealthLog();
        log.setMemberId(memberId);
        log.setLogDate(LocalDate.now());
        log.setWeight(request.getWeight());
        log.setHeartRate(request.getHeartRate());
        log.setNotes(request.getNotes());
        return healthLogRepository.save(log);
    }

    @Override
    @Transactional
    public MemberGoal createGoal(Long memberId, CreateGoalRequest request) {
        // Deactivate any existing active goal
        goalRepository.findTopByMemberIdAndIsActiveTrueOrderByCreatedAtDesc(memberId)
                .ifPresent(existing -> {
                    existing.setIsActive(false);
                    goalRepository.save(existing);
                });

        MemberGoal goal = new MemberGoal();
        goal.setMemberId(memberId);
        goal.setGoalDescription(request.getGoalDescription());
        goal.setTargetDate(request.getTargetDate());
        goal.setIsActive(true);
        return goalRepository.save(goal);
    }

    @Override
    public MemberProgressSummary getProgressSummary(Long memberId) {
        LocalDate today = LocalDate.now();

        Optional<MemberHealthLog> healthLog =
                healthLogRepository.findTopByMemberIdAndLogDateOrderByCreatedAtDesc(memberId, today);
        Optional<MemberGoal> goal =
                goalRepository.findTopByMemberIdAndIsActiveTrueOrderByCreatedAtDesc(memberId);

        MemberProgressSummary summary = new MemberProgressSummary();
        healthLog.ifPresent(h -> {
            summary.setTodayWeight(h.getWeight());
            summary.setHeartRate(h.getHeartRate());
        });
        goal.ifPresent(g -> {
            String targetStr = g.getTargetDate() != null
                    ? " by " + g.getTargetDate().format(GOAL_DATE_FORMAT)
                    : "";
            summary.setGoalSummary("Goal: " + g.getGoalDescription() + targetStr);
        });

        return summary;
    }

    @Override
    public MemberExtendedProfileResponse getExtendedProfile(Long memberId) {
        // Ensure member exists before reading dependent tables.
        customerRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        Optional<MemberProfile> profileOpt = profileRepository.findByMemberId(memberId);
        Optional<MemberHealthLog> healthOpt = healthLogRepository.findTopByMemberIdOrderByCreatedAtDesc(memberId);
        Optional<MemberGoal> goalOpt = goalRepository.findTopByMemberIdAndIsActiveTrueOrderByCreatedAtDesc(memberId)
                .or(() -> goalRepository.findTopByMemberIdOrderByCreatedAtDesc(memberId));

        MemberExtendedProfileResponse response = new MemberExtendedProfileResponse();

        profileOpt.ifPresent(p -> {
            response.setDob(p.getDateOfBirth());
            response.setGender(p.getGender());
            response.setEmergencyName(p.getEmergencyContactName());
            response.setEmergencyPhone(p.getEmergencyContactPhone());
            response.setGymExperience(p.getGymExperience());
            if (p.getPhoto() != null && p.getPhoto().length > 0) {
                response.setPhoto(new String(p.getPhoto(), StandardCharsets.UTF_8));
            }
        });

        healthOpt.ifPresent(h -> {
            response.setHeight(h.getHeight());
            response.setWeight(h.getWeight());
            response.setBodyFat(h.getBodyFat());
            response.setMedicalConditions(h.getMedicalConditions());
            response.setPreviousInjuries(h.getPreviousInjuries());
            response.setCurrentMedications(h.getCurrentMedications());
            response.setAllergies(h.getAllergies());
        });

        goalOpt.ifPresent(g -> {
            response.setFitnessGoal(g.getFitnessGoal());
            response.setDietPreference(g.getDietPreference());
            response.setDietTarget(g.getDietTarget());
        });

        return response;
    }

    @Override
    @Transactional
    public MemberExtendedProfileResponse upsertExtendedProfile(Long memberId, UpsertMemberExtendedProfileRequest request) {
        customerRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        MemberProfile profile = profileRepository.findByMemberId(memberId)
                .orElseGet(MemberProfile::new);
        profile.setMemberId(memberId);
        profile.setDateOfBirth(request.getDob());
        profile.setGender(request.getGender());
        profile.setEmergencyContactName(request.getEmergencyName());
        profile.setEmergencyContactPhone(request.getEmergencyPhone());
        profile.setGymExperience(request.getGymExperience());
        if (request.getPhoto() != null) {
            profile.setPhoto(request.getPhoto().getBytes(StandardCharsets.UTF_8));
        }
        profileRepository.save(profile);

        MemberHealthLog healthLog = healthLogRepository.findTopByMemberIdOrderByCreatedAtDesc(memberId)
                .orElseGet(MemberHealthLog::new);
        if (healthLog.getId() == null) {
            healthLog.setMemberId(memberId);
            healthLog.setLogDate(LocalDate.now());
        }
        healthLog.setHeight(request.getHeight());
        healthLog.setWeight(request.getWeight());
        healthLog.setBodyFat(request.getBodyFat());
        healthLog.setMedicalConditions(request.getMedicalConditions());
        healthLog.setPreviousInjuries(request.getPreviousInjuries());
        healthLog.setCurrentMedications(request.getCurrentMedications());
        healthLog.setAllergies(request.getAllergies());
        healthLogRepository.save(healthLog);

        String fallbackDescription = request.getFitnessGoal() != null && !request.getFitnessGoal().isBlank()
                ? request.getFitnessGoal()
                : "Fitness profile update";

        MemberGoal goal = goalRepository.findTopByMemberIdAndIsActiveTrueOrderByCreatedAtDesc(memberId)
                .orElseGet(MemberGoal::new);
        if (goal.getId() == null) {
            goal.setMemberId(memberId);
            goal.setIsActive(true);
            goal.setGoalDescription(fallbackDescription);
        }
        goal.setFitnessGoal(request.getFitnessGoal());
        goal.setDietPreference(request.getDietPreference());
        goal.setDietTarget(request.getDietTarget());
        goal.setGoalDescription(
                (request.getFitnessGoal() != null && !request.getFitnessGoal().isBlank())
                        ? request.getFitnessGoal()
                        : goal.getGoalDescription()
        );
        goalRepository.save(goal);

        return getExtendedProfile(memberId);
    }
}
