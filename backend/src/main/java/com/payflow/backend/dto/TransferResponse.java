package com.payflow.backend.dto;

import java.math.BigDecimal;

public record TransferResponse(
    boolean success, String message, String transactionId, BigDecimal amount) {}
