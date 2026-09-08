package com.payflow.backend.dto;

public record AccountValidationResponse(boolean valid, String message, String accountHolderName) {}
