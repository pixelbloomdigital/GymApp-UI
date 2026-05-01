package com.pixelbloom.authLogin.entity;


import com.pixelbloom.authLogin.enums.BatchCategory;
import com.pixelbloom.authLogin.enums.SlotType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor @NoArgsConstructor
public class DemoSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    @Enumerated(EnumType.STRING)
    private BatchCategory batchType;

    @Enumerated(EnumType.STRING)
    private SlotType slotType;

    private String startTime;
    private String endTime;

    private int capacity;
    private int bookedCount;

}
