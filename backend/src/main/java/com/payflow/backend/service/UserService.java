package com.payflow.backend.service;

import com.payflow.backend.domain.AppUser;
import com.payflow.backend.domain.UserRole;
import com.payflow.backend.dto.AuthResponse;
import com.payflow.backend.dto.ChangePasswordRequest;
import com.payflow.backend.dto.CreateUserRequest;
import com.payflow.backend.dto.LoginRequest;
import com.payflow.backend.dto.ResetPasswordRequest;
import com.payflow.backend.dto.UpdateUserRequest;
import com.payflow.backend.dto.UserResponse;
import com.payflow.backend.exception.BusinessRuleException;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.UserRepository;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Objects;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private static final SecureRandom RANDOM = new SecureRandom();
  private final UserRepository users;
  private final NotificationService notifications;
  private final JwtService jwtService;

  public UserService(
      UserRepository users, NotificationService notifications, JwtService jwtService) {
    this.users = users;
    this.notifications = notifications;
    this.jwtService = jwtService;
  }

  @Transactional
  public UserResponse create(CreateUserRequest request) {
    if (users.existsByEmail(request.email()))
      throw new BusinessRuleException("Email address is already registered");
    if (users.existsByMobileNumber(request.mobileNumber()))
      throw new BusinessRuleException("Mobile number is already registered");
    AppUser user =
        new AppUser(
            request.fullName(),
            request.email(),
            request.mobileNumber(),
            request.role() == null ? UserRole.CUSTOMER : request.role());
    if (request.password() != null && !request.password().isBlank())
      user.updatePassword(hash(request.password()));
    return UserResponse.from(users.save(user));
  }

  @Transactional(readOnly = true)
  public UserResponse findByEmail(String email) {
    return UserResponse.from(
        users
            .findByEmailIgnoreCase(email)
            .orElseThrow(
                () -> new com.payflow.backend.exception.NotFoundException("User not found")));
  }

  @Transactional
  public AuthResponse authenticate(LoginRequest request) {
    AppUser user =
        users
            .findByEmailIgnoreCase(request.email())
            .orElseThrow(() -> new NotFoundException("Invalid email or password"));
    // Legacy seeded demo profiles have no hash and remain usable for development.
    if (user.getPasswordHash() != null && !matches(request.password(), user.getPasswordHash())) {
      throw new BusinessRuleException("Invalid email or password");
    }
    notifications.loginAlert(user);
    return new AuthResponse(jwtService.issue(user), UserResponse.from(user));
  }

  @Transactional
  public UserResponse update(Long userId, UpdateUserRequest request) {
    AppUser user =
        users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    users
        .findByEmailIgnoreCase(request.email())
        .ifPresent(
            existing -> {
              if (!existing.getId().equals(userId))
                throw new BusinessRuleException("Email address is already registered");
            });
    user.updateProfile(request.fullName().trim(), request.email().trim());
    return UserResponse.from(users.save(user));
  }

  @Transactional
  public void changePassword(Long userId, ChangePasswordRequest request) {
    AppUser user =
        users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    if (user.getPasswordHash() != null
        && !matches(request.currentPassword(), user.getPasswordHash())) {
      throw new BusinessRuleException("Current password is incorrect");
    }
    user.updatePassword(hash(request.newPassword()));
    users.save(user);
  }

  @Transactional
  public void resetPassword(ResetPasswordRequest request) {
    String email = request.email().trim();
    String mobile = request.mobileNumber().trim();
    AppUser user =
        users
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BusinessRuleException("Email address is not registered"));
    if (!Objects.equals(user.getMobileNumber(), mobile)) {
      throw new BusinessRuleException("Mobile number does not match this email address");
    }
    user.updatePassword(hash(request.newPassword()));
    users.save(user);
  }

  private static String hash(String password) {
    try {
      byte[] salt = new byte[16];
      RANDOM.nextBytes(salt);
      byte[] digest = digest(password, salt);
      return Base64.getEncoder().encodeToString(salt)
          + "$"
          + Base64.getEncoder().encodeToString(digest);
    } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
      throw new IllegalStateException("Password hashing is unavailable", e);
    }
  }

  private static boolean matches(String password, String stored) {
    try {
      String[] parts = stored.split("\\$", -1);
      return parts.length == 2
          && MessageDigest.isEqual(
              Base64.getDecoder().decode(parts[1]),
              digest(password, Base64.getDecoder().decode(parts[0])));
    } catch (IllegalArgumentException | NoSuchAlgorithmException | InvalidKeySpecException e) {
      return false;
    }
  }

  private static byte[] digest(String password, byte[] salt)
      throws NoSuchAlgorithmException, InvalidKeySpecException {
    PBEKeySpec key = new PBEKeySpec(password.toCharArray(), salt, 120_000, 256);
    return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(key).getEncoded();
  }
}
