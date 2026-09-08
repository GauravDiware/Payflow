package com.payflow.backend.controller;

import com.payflow.backend.domain.TransactionStatus;
import com.payflow.backend.dto.CreateTransferRequest;
import com.payflow.backend.dto.DirectTransferRequest;
import com.payflow.backend.dto.PageResponse;
import com.payflow.backend.dto.ReviewTransactionRequest;
import com.payflow.backend.dto.TransactionResponse;
import com.payflow.backend.dto.TransferResponse;
import com.payflow.backend.service.PaymentService;
import com.payflow.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TransactionController {

  private final PaymentService paymentService;
  private final TransactionService transactionService;

  public TransactionController(
      PaymentService paymentService, TransactionService transactionService) {
    this.paymentService = paymentService;
    this.transactionService = transactionService;
  }

  @PostMapping("/users/{userId}/transfers")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("#userId.toString() == authentication.name")
  public TransactionResponse transfer(
      @PathVariable Long userId, @Valid @RequestBody CreateTransferRequest request) {
    return paymentService.transfer(userId, request);
  }

  @PostMapping("/users/{userId}/transfers/direct")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("#userId.toString() == authentication.name")
  public TransferResponse transferToAccount(
      @PathVariable Long userId, @Valid @RequestBody DirectTransferRequest request) {
    return paymentService.transferToAccount(userId, request);
  }

  @GetMapping("/transactions/{reference}")
  @PreAuthorize("@authorization.canViewTransaction(#reference, authentication)")
  public TransactionResponse getTransaction(@PathVariable String reference) {
    return transactionService.getTransaction(reference);
  }

  @GetMapping("/users/{userId}/transactions")
  @PreAuthorize("#userId.toString() == authentication.name")
  public PageResponse<TransactionResponse> listUserTransactions(
      @PathVariable Long userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return transactionService.listUserTransactions(userId, page, size);
  }

  @GetMapping("/admin/transactions")
  public PageResponse<TransactionResponse> listAdminTransactions(
      @RequestParam(required = false) TransactionStatus status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return transactionService.listAdminTransactions(status, page, size);
  }

  @PostMapping("/admin/transactions/{reference}/review")
  public TransactionResponse reviewTransaction(
      @PathVariable String reference, @Valid @RequestBody ReviewTransactionRequest request) {
    return paymentService.review(reference, request);
  }
}
