package com.payflow.backend.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_transaction")
public class PaymentTransaction {
  @Id private UUID id = UUID.randomUUID();

  @Column(nullable = false, unique = true)
  private String reference;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "from_account_id", nullable = false)
  private Account fromAccount;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_account_id", nullable = false)
  private Account toAccount;

  @Column(nullable = false, precision = 19, scale = 2)
  private BigDecimal amount;

  @Column(nullable = false, length = 3)
  private String currency;

  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TransactionStatus status;

  @Column(name = "failure_reason")
  private String failureReason;

  @Column(name = "flag_reason")
  private String flagReason;

  @Column(name = "risk_level")
  private String riskLevel;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected PaymentTransaction() {}

  public PaymentTransaction(
      String ref,
      Account from,
      Account to,
      BigDecimal amount,
      String description,
      TransactionStatus status) {
    this.reference = ref;
    this.fromAccount = from;
    this.toAccount = to;
    this.amount = amount;
    this.currency = from.getCurrency();
    this.description = description;
    this.status = status;
  }

  public UUID getId() {
    return id;
  }

  public String getReference() {
    return reference;
  }

  public Account getFromAccount() {
    return fromAccount;
  }

  public Account getToAccount() {
    return toAccount;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getCurrency() {
    return currency;
  }

  public String getDescription() {
    return description;
  }

  public TransactionStatus getStatus() {
    return status;
  }

  public String getFailureReason() {
    return failureReason;
  }

  public String getFlagReason() {
    return flagReason;
  }

  public String getRiskLevel() {
    return riskLevel;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void flag(String reason, String risk) {
    status = TransactionStatus.FLAGGED;
    flagReason = reason;
    riskLevel = risk;
  }

  public void approve() {
    status = TransactionStatus.SUCCESS;
    flagReason = null;
    riskLevel = null;
  }

  public void reject(String reason) {
    status = TransactionStatus.FAILED;
    failureReason = reason;
  }
}
