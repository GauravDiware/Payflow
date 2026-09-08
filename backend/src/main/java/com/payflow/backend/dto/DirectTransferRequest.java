package com.payflow.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record DirectTransferRequest(
    @NotNull UUID senderAccountId,
    @NotBlank @Pattern(regexp = "^[0-9]{12}$", message = "Please enter a valid account number.")
        String recipientAccountNumber,
    @NotNull
        @DecimalMin(value = "0.01", message = "Transfer amount must be greater than zero.")
        @Digits(integer = 17, fraction = 2)
        BigDecimal amount,
    @Size(max = 100) String description) {}
