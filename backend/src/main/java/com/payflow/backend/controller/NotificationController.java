package com.payflow.backend.controller;

import com.payflow.backend.dto.NotificationResponse;
import com.payflow.backend.service.NotificationService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/{userId}/notifications")
public class NotificationController {
  private final NotificationService notifications;

  public NotificationController(NotificationService notifications) {
    this.notifications = notifications;
  }

  @GetMapping
  @PreAuthorize("#userId.toString() == authentication.name")
  public List<NotificationResponse> list(@PathVariable Long userId) {
    return notifications.list(userId);
  }
}
