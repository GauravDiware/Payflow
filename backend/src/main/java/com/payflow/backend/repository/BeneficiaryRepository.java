package com.payflow.backend.repository;

import com.payflow.backend.domain.Beneficiary;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {
  List<Beneficiary> findByOwnerId(Long ownerId);

  Optional<Beneficiary> findByIdAndOwnerId(UUID id, Long ownerId);
}
