package com.payflow.backend.domain;

public enum TransactionStatus {
  INITIATED,
  VALIDATING,
  PROCESSING,
  SUCCESS,
  FAILED,
  FLAGGED
}
