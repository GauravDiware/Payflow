package com.payflow.backend.dto;

import com.payflow.backend.domain.Beneficiary;
import java.util.UUID;

public record BeneficiaryResponse(
    UUID id, String name, String accountNumber, String nickname, boolean verified) {

  public static BeneficiaryResponse from(Beneficiary beneficiary) {
    return new BeneficiaryResponse(
        beneficiary.getId(),
        beneficiary.getName(),
        beneficiary.getAccountNumber(),
        beneficiary.getNickname(),
        beneficiary.isVerified());
  }
}
