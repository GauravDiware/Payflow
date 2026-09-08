package com.payflow.backend.service;

import com.payflow.backend.domain.PaymentTransaction;
import com.payflow.backend.domain.TransactionStatus;
import com.payflow.backend.dto.PageResponse;
import com.payflow.backend.dto.TransactionResponse;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

  private final TransactionRepository transactions;
  private final UserLookupService users;

  public TransactionService(TransactionRepository transactions, UserLookupService users) {
    this.transactions = transactions;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public TransactionResponse getTransaction(String reference) {
    return TransactionResponse.from(
        transactions
            .findByReference(reference)
            .orElseThrow(() -> new NotFoundException("Transaction not found")));
  }

  @Transactional(readOnly = true)
  public PageResponse<TransactionResponse> listUserTransactions(Long userId, int page, int size) {
    users.requireUser(userId);
    return toPageResponse(transactions.findVisibleToUser(userId, pageRequest(page, size)));
  }

  @Transactional(readOnly = true)
  public PageResponse<TransactionResponse> listAdminTransactions(
      TransactionStatus status, int page, int size) {
    PageRequest pageRequest = pageRequest(page, size);
    Page<PaymentTransaction> result =
        status == null
            ? transactions.findAll(pageRequest)
            : transactions.findByStatus(status, pageRequest);
    return toPageResponse(result);
  }

  private PageRequest pageRequest(int page, int size) {
    return PageRequest.of(
        Math.max(0, page),
        Math.min(Math.max(1, size), 100),
        Sort.by(Sort.Direction.DESC, "createdAt"));
  }

  private PageResponse<TransactionResponse> toPageResponse(Page<PaymentTransaction> result) {
    return new PageResponse<>(
        result.getContent().stream().map(TransactionResponse::from).toList(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages());
  }
}
