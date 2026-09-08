package com.payflow.backend.dto;

import com.payflow.backend.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
    @NotBlank @Size(max = 120) String fullName,
    @NotBlank @Email @Size(max = 255) String email,
    @NotBlank
        @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile number must contain 10 to 15 digits")
        String mobileNumber,
    @Size(min = 8, max = 128) String password,
    UserRole role) {}
