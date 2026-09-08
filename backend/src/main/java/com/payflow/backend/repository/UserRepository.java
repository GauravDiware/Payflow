package com.payflow.backend.repository;

import com.payflow.backend.domain.AppUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Long> {
  boolean existsByEmail(String email);

  boolean existsByMobileNumber(String mobileNumber);

  Optional<AppUser> findByEmailIgnoreCase(String email);
}
