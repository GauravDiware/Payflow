package com.payflow.backend.dto;

import com.payflow.backend.domain.Account;
import com.payflow.backend.domain.AccountStatus;
import com.payflow.backend.domain.AccountType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountResponse(
    UUID id,
    String accountNumber,
    AccountType type,
    String currency,
    BigDecimal balance,
    AccountStatus status,
    Instant createdAt,
    String holderName) {

  public static AccountResponse from(Account account) {
    return new AccountResponse(
        account.getId(),
        account.getAccountNumber(),
        account.getType(),
        account.getCurrency(),
        account.getBalance(),
        account.getStatus(),
        account.getCreatedAt(),
        account.getOwner().getFullName());
  }
}
