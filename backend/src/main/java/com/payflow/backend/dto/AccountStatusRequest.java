package com.payflow.backend.dto;

import com.payflow.backend.domain.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record AccountStatusRequest(@NotNull AccountStatus status) {}
