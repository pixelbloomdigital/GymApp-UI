package com.pixelbloom.authLogin.repository;

import com.pixelbloom.authLogin.entity.DemoSlot;

import com.pixelbloom.authLogin.enums.BatchCategory;
import com.pixelbloom.authLogin.enums.SlotType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface DemoSlotRepository extends JpaRepository<DemoSlot, Long> {
    Optional<DemoSlot> findByBatchTypeAndSlotType(BatchCategory batchType, SlotType slotType);
    List<DemoSlot> findAllByOrderByBatchTypeAscSlotTypeAsc();


}
