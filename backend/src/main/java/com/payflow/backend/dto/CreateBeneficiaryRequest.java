package com.payflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBeneficiaryRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 32) String accountNumber,
    @Size(max = 80) String nickname) {}
