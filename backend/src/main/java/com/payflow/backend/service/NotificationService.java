package com.payflow.backend.service;

import com.payflow.backend.domain.*;
import com.payflow.backend.dto.NotificationResponse;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.NotificationRepository;
import com.payflow.backend.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
  private final NotificationRepository notifications;
  private final UserRepository users;

  public NotificationService(NotificationRepository notifications, UserRepository users) {
    this.notifications = notifications;
    this.users = users;
  }

  @Transactional
  public void loginAlert(AppUser user) {
    send(user, "security", "New sign-in", "Your PayFlow account was signed in successfully.");
  }

  @Transactional
  public void transferAlert(AppUser user, String title, String message) {
    send(user, "transaction", title, message);
  }

  @Transactional(readOnly = true)
  public List<NotificationResponse> list(Long userId) {
    if (!users.existsById(userId)) throw new NotFoundException("User not found");
    return notifications.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
        .map(NotificationResponse::from)
        .toList();
  }

  private void send(AppUser user, String type, String title, String message) {
    // Development provider: persist the SMS outbox/inbox entry. Replace this adapter with
    // Twilio/SNS/etc. in production.
    UserNotification notification =
        new UserNotification(
            user,
            NotificationChannel.SMS,
            type,
            title,
            message,
            user.getMobileNumber(),
            NotificationStatus.SENT);
    notifications.save(notification);
  }
}
