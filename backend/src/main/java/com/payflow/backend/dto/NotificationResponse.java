package com.payflow.backend.dto;

import com.payflow.backend.domain.UserNotification;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    String type,
    String title,
    String message,
    String channel,
    String status,
    Instant timestamp,
    boolean read) {
  public static NotificationResponse from(UserNotification n) {
    return new NotificationResponse(
        n.getId(),
        n.getType(),
        n.getTitle(),
        n.getMessage(),
        n.getChannel().name(),
        n.getStatus().name(),
        n.getCreatedAt(),
        n.isRead());
  }
}
