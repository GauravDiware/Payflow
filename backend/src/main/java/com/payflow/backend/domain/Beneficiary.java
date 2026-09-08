package com.payflow.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "beneficiary",
    uniqueConstraints = @UniqueConstraint(columnNames = {"owner_id", "account_number"}))
public class Beneficiary {
  @Id private UUID id = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private AppUser owner;

  @Column(nullable = false)
  private String name;

  @Column(name = "account_number", nullable = false)
  private String accountNumber;

  private String nickname;

  @Column(nullable = false)
  private boolean verified = true;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Beneficiary() {}

  public Beneficiary(AppUser owner, String name, String accountNumber, String nickname) {
    this.owner = owner;
    this.name = name;
    this.accountNumber = accountNumber;
    this.nickname = nickname;
  }

  public UUID getId() {
    return id;
  }

  public AppUser getOwner() {
    return owner;
  }

  public String getName() {
    return name;
  }

  public String getAccountNumber() {
    return accountNumber;
  }

  public String getNickname() {
    return nickname;
  }

  public boolean isVerified() {
    return verified;
  }
}
