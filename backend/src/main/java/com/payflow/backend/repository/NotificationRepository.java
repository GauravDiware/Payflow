package com.payflow.backend.repository;

import com.payflow.backend.domain.UserNotification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<UserNotification, UUID> {
  List<UserNotification> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
}
