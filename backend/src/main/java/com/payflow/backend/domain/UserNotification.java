package com.payflow.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_notification")
public class UserNotification {
  @Id private UUID id = UUID.randomUUID();

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private AppUser user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private NotificationChannel channel;

  @Column(nullable = false, length = 20)
  private String type;

  @Column(nullable = false, length = 120)
  private String title;

  @Column(nullable = false, length = 500)
  private String message;

  @Column(length = 255)
  private String recipient;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private NotificationStatus status;

  @Column(nullable = false)
  private boolean read = false;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected UserNotification() {}

  public UserNotification(
      AppUser user,
      NotificationChannel channel,
      String type,
      String title,
      String message,
      String recipient,
      NotificationStatus status) {
    this.user = user;
    this.channel = channel;
    this.type = type;
    this.title = title;
    this.message = message;
    this.recipient = recipient;
    this.status = status;
  }

  public UUID getId() {
    return id;
  }

  public AppUser getUser() {
    return user;
  }

  public NotificationChannel getChannel() {
    return channel;
  }

  public String getType() {
    return type;
  }

  public String getTitle() {
    return title;
  }

  public String getMessage() {
    return message;
  }

  public String getRecipient() {
    return recipient;
  }

  public NotificationStatus getStatus() {
    return status;
  }

  public boolean isRead() {
    return read;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void markRead() {
    read = true;
  }
}
