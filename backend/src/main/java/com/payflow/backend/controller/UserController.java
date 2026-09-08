package com.payflow.backend.controller;

import com.payflow.backend.dto.AuthResponse;
import com.payflow.backend.dto.ChangePasswordRequest;
import com.payflow.backend.dto.CreateUserRequest;
import com.payflow.backend.dto.LoginRequest;
import com.payflow.backend.dto.ResetPasswordRequest;
import com.payflow.backend.dto.UpdateUserRequest;
import com.payflow.backend.dto.UserResponse;
import com.payflow.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
  private final UserService users;

  public UserController(UserService users) {
    this.users = users;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return users.create(request);
  }

  @GetMapping(params = "email")
  public UserResponse byEmail(@RequestParam String email) {
    return users.findByEmail(email);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return users.authenticate(request);
  }

  @PostMapping("/password/reset")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    users.resetPassword(request);
  }

  @PutMapping("/{userId}")
  @PreAuthorize("#userId.toString() == authentication.name")
  public UserResponse update(
      @PathVariable Long userId, @Valid @RequestBody UpdateUserRequest request) {
    return users.update(userId, request);
  }

  @PutMapping("/{userId}/password")
  @PreAuthorize("#userId.toString() == authentication.name")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void changePassword(
      @PathVariable Long userId, @Valid @RequestBody ChangePasswordRequest request) {
    users.changePassword(userId, request);
  }
}
