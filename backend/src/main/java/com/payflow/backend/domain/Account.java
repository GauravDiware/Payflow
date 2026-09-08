package com.payflow.backend.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "account")
public class Account {
  @Id private UUID id = UUID.randomUUID();

  @Column(name = "account_number", nullable = false, unique = true)
  private String accountNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private AppUser owner;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AccountType type;

  @Column(nullable = false, length = 3)
  private String currency;

  @Column(nullable = false, precision = 19, scale = 2)
  private BigDecimal balance;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AccountStatus status = AccountStatus.ACTIVE;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public UUID getId() {
    return id;
  }

  public String getAccountNumber() {
    return accountNumber;
  }

  public AppUser getOwner() {
    return owner;
  }

  public AccountType getType() {
    return type;
  }

  public String getCurrency() {
    return currency;
  }

  public BigDecimal getBalance() {
    return balance;
  }

  public AccountStatus getStatus() {
    return status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  protected Account() {}

  public Account(
      String accountNumber, AppUser owner, AccountType type, String currency, BigDecimal balance) {
    this.accountNumber = accountNumber;
    this.owner = owner;
    this.type = type;
    this.currency = currency;
    this.balance = balance;
  }

  public void debit(BigDecimal amount) {
    balance = balance.subtract(amount);
  }

  public void credit(BigDecimal amount) {
    balance = balance.add(amount);
  }

  public void setStatus(AccountStatus status) {
    this.status = status;
  }
}
