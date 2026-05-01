package com.pixelbloom.authLogin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_notifications")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisitorNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long visitorId;

    private String message;

    private String type;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private boolean readFlag;
}
