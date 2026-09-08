package com.payflow.backend.dto;

import com.payflow.backend.domain.PaymentTransaction;
import com.payflow.backend.domain.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(
    String reference,
    String fromAccount,
    String fromAccountType,
    String toName,
    String toAccount,
    BigDecimal amount,
    String currency,
    String description,
    TransactionStatus status,
    Instant createdAt,
    String failureReason,
    String flagReason,
    String riskLevel) {

  public static TransactionResponse from(PaymentTransaction transaction) {
    return new TransactionResponse(
        transaction.getReference(),
        transaction.getFromAccount().getAccountNumber(),
        transaction.getFromAccount().getType().name(),
        transaction.getToAccount().getOwner().getFullName(),
        transaction.getToAccount().getAccountNumber(),
        transaction.getAmount(),
        transaction.getCurrency(),
        transaction.getDescription(),
        transaction.getStatus(),
        transaction.getCreatedAt(),
        transaction.getFailureReason(),
        transaction.getFlagReason(),
        transaction.getRiskLevel());
  }
}
