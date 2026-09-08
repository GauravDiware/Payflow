package com.payflow.backend.dto;

import com.payflow.backend.domain.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateAccountRequest(
    @NotNull Long userId,
    @NotNull AccountType type,
    String currency,
    @DecimalMin(value = "0.00") BigDecimal initialBalance) {}
