package com.payflow.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_user")
public class AppUser {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "full_name", nullable = false)
  private String fullName;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "mobile_number", unique = true)
  private String mobileNumber;

  @Column(name = "password_hash", length = 255)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserStatus status = UserStatus.ACTIVE;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public Long getId() {
    return id;
  }

  public String getFullName() {
    return fullName;
  }

  public String getEmail() {
    return email;
  }

  public UserRole getRole() {
    return role;
  }

  public UserStatus getStatus() {
    return status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public String getMobileNumber() {
    return mobileNumber;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void updateProfile(String fullName, String email) {
    this.fullName = fullName;
    this.email = email;
  }

  public void updatePassword(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  protected AppUser() {}

  public AppUser(String fullName, String email, String mobileNumber, UserRole role) {
    this.fullName = fullName;
    this.email = email;
    this.mobileNumber = mobileNumber;
    this.role = role;
  }

  public void setStatus(UserStatus status) {
    this.status = status;
  }
}
