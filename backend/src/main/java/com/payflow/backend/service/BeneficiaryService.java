package com.payflow.backend.service;

import com.payflow.backend.dto.BeneficiaryResponse;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.BeneficiaryRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BeneficiaryService {

  private final BeneficiaryRepository beneficiaries;
  private final UserLookupService users;

  public BeneficiaryService(BeneficiaryRepository beneficiaries, UserLookupService users) {
    this.beneficiaries = beneficiaries;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<BeneficiaryResponse> listBeneficiaries(Long userId) {
    users.requireUser(userId);
    return beneficiaries.findByOwnerId(userId).stream().map(BeneficiaryResponse::from).toList();
  }

  @Transactional
  public void deleteBeneficiary(Long userId, UUID beneficiaryId) {
    var beneficiary =
        beneficiaries
            .findByIdAndOwnerId(beneficiaryId, userId)
            .orElseThrow(() -> new NotFoundException("Beneficiary not found"));
    beneficiaries.delete(beneficiary);
  }
}
