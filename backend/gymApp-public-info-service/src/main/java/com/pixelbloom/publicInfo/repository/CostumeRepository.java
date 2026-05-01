package com.pixelbloom.publicInfo.repository;

import com.pixelbloom.publicInfo.entity.Costume;
import com.pixelbloom.publicInfo.enums.CostumeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CostumeRepository extends JpaRepository<Costume, Long> {
    List<Costume> findByIsActiveTrueOrderByNameAsc();
    List<Costume> findByCategoryAndIsActiveTrue(CostumeCategory category);
}
