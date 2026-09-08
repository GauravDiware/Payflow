package com.payflow.backend.dto;

public record AuthResponse(String token, UserResponse user) {}
