package com.pixelbloom.coreService.model.memberModel;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents an active fitness goal for a member (e.g. "Lose 5 kg by June 2026").
 */
@Entity
@Table(name = "member_goals")
@Data
public class MemberGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long memberId;

    /** Short description of the goal, e.g. "Lose 5 kg" */
    @Column(nullable = false, length = 500)
    private String goalDescription;

    private String fitnessGoal;
    private String dietPreference;
    private String dietTarget;

    /** Target completion date */
    private LocalDate targetDate;

    /** Whether this goal is currently active */
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
