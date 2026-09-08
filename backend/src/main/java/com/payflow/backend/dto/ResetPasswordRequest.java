package com.payflow.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank @Email String email,
    @NotBlank String mobileNumber,
    @NotBlank @Size(min = 8, max = 128) String newPassword) {}
