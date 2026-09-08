package com.payflow.backend.service;

import com.payflow.backend.domain.Account;
import com.payflow.backend.domain.AccountStatus;
import com.payflow.backend.domain.AppUser;
import com.payflow.backend.domain.Beneficiary;
import com.payflow.backend.domain.PaymentTransaction;
import com.payflow.backend.domain.TransactionStatus;
import com.payflow.backend.dto.BeneficiaryResponse;
import com.payflow.backend.dto.CreateBeneficiaryRequest;
import com.payflow.backend.dto.CreateTransferRequest;
import com.payflow.backend.dto.DirectTransferRequest;
import com.payflow.backend.dto.ReviewTransactionRequest;
import com.payflow.backend.dto.TransactionResponse;
import com.payflow.backend.dto.TransferResponse;
import com.payflow.backend.exception.BusinessRuleException;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.AccountRepository;
import com.payflow.backend.repository.BeneficiaryRepository;
import com.payflow.backend.repository.TransactionRepository;
import com.payflow.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

  private static final BigDecimal REVIEW_THRESHOLD = new BigDecimal("50000.00");
  private static final DateTimeFormatter REFERENCE_TIME_FORMAT =
      DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").withZone(ZoneOffset.UTC);

  private final AccountRepository accounts;
  private final BeneficiaryRepository beneficiaries;
  private final TransactionRepository transactions;
  private final UserRepository users;
  private final NotificationService notifications;

  public PaymentService(
      AccountRepository accounts,
      BeneficiaryRepository beneficiaries,
      TransactionRepository transactions,
      UserRepository users,
      NotificationService notifications) {
    this.accounts = accounts;
    this.beneficiaries = beneficiaries;
    this.transactions = transactions;
    this.users = users;
    this.notifications = notifications;
  }

  @Transactional
  public BeneficiaryResponse addBeneficiary(Long ownerId, CreateBeneficiaryRequest request) {
    AppUser owner =
        users.findById(ownerId).orElseThrow(() -> new NotFoundException("User not found"));
    Account destination =
        accounts
            .findByAccountNumber(request.accountNumber())
            .orElseThrow(() -> new BusinessRuleException("Beneficiary account was not found"));

    if (destination.getOwner().getId().equals(ownerId)) {
      throw new BusinessRuleException("A beneficiary cannot be one of your own accounts");
    }

    Beneficiary beneficiary =
        new Beneficiary(owner, request.name(), request.accountNumber(), request.nickname());
    return BeneficiaryResponse.from(beneficiaries.save(beneficiary));
  }

  @Transactional
  public TransactionResponse transfer(Long ownerId, CreateTransferRequest request) {
    Beneficiary beneficiary =
        beneficiaries
            .findByIdAndOwnerId(request.beneficiaryId(), ownerId)
            .orElseThrow(() -> new NotFoundException("Beneficiary not found"));
    Account sender =
        accounts
            .findByIdForUpdate(request.fromAccountId())
            .orElseThrow(() -> new NotFoundException("Source account not found"));
    Account receiver =
        accounts
            .findByAccountNumber(beneficiary.getAccountNumber())
            .orElseThrow(() -> new BusinessRuleException("Beneficiary account was not found"));

    validateTransfer(ownerId, sender, receiver, request.amount());

    PaymentTransaction transaction =
        new PaymentTransaction(
            nextReference(),
            sender,
            receiver,
            request.amount(),
            request.description(),
            TransactionStatus.SUCCESS);

    if (request.amount().compareTo(REVIEW_THRESHOLD) >= 0) {
      transaction.flag("Transaction amount exceeded the configured review limit.", "HIGH");
    } else {
      sender.debit(request.amount());
      receiver.credit(request.amount());
    }

    TransactionResponse response = TransactionResponse.from(transactions.save(transaction));
    notifyTransfer(sender, receiver, transaction);
    return response;
  }

  @Transactional
  public TransferResponse transferToAccount(Long ownerId, DirectTransferRequest request) {
    Account sender =
        accounts
            .findByIdForUpdate(request.senderAccountId())
            .orElseThrow(() -> new NotFoundException("Source account not found"));
    if (!request.recipientAccountNumber().matches("^[0-9]{12}$")) {
      throw new BusinessRuleException("Please enter a valid account number.");
    }
    Account receiver =
        accounts
            .findByAccountNumberForUpdate(request.recipientAccountNumber())
            .orElseThrow(() -> new BusinessRuleException("User not found."));
    validateTransfer(ownerId, sender, receiver, request.amount());
    sender.debit(request.amount());
    receiver.credit(request.amount());
    PaymentTransaction transaction =
        new PaymentTransaction(
            nextReference(),
            sender,
            receiver,
            request.amount(),
            request.description(),
            TransactionStatus.SUCCESS);
    transactions.save(transaction);
    notifyTransfer(sender, receiver, transaction);
    return new TransferResponse(
        true, "Money transferred successfully.", transaction.getReference(), request.amount());
  }

  private void notifyTransfer(Account sender, Account receiver, PaymentTransaction transaction) {
    String statusText =
        transaction.getStatus() == TransactionStatus.FLAGGED
            ? "is under review"
            : "was completed successfully";
    String message =
        "Transfer "
            + transaction.getReference()
            + " for "
            + transaction.getAmount()
            + " "
            + transaction.getCurrency()
            + " "
            + statusText
            + ".";
    notifications.transferAlert(sender.getOwner(), "Transfer update", message);
    if (transaction.getStatus() == TransactionStatus.SUCCESS) {
      notifications.transferAlert(
          receiver.getOwner(),
          "Money received",
          "You received "
              + transaction.getAmount()
              + " "
              + transaction.getCurrency()
              + " from a PayFlow account.");
    }
  }

  @Transactional
  public TransactionResponse review(String reference, ReviewTransactionRequest request) {
    PaymentTransaction transaction =
        transactions
            .findByReference(reference)
            .orElseThrow(() -> new NotFoundException("Transaction not found"));

    if (transaction.getStatus() != TransactionStatus.FLAGGED) {
      throw new BusinessRuleException("Only flagged transactions can be reviewed");
    }

    if ("APPROVE".equals(request.decision())) {
      approveFlaggedTransaction(transaction);
    } else {
      String reason =
          request.reason() == null || request.reason().isBlank()
              ? "Rejected during review"
              : request.reason();
      transaction.reject(reason);
    }

    return TransactionResponse.from(transaction);
  }

  private void validateTransfer(Long ownerId, Account sender, Account receiver, BigDecimal amount) {
    if (!sender.getOwner().getId().equals(ownerId)) {
      throw new BusinessRuleException("Source account does not belong to the current user");
    }
    if (sender.getId().equals(receiver.getId())) {
      throw new BusinessRuleException("You cannot transfer money to the same account.");
    }
    if (sender.getStatus() != AccountStatus.ACTIVE
        || receiver.getStatus() != AccountStatus.ACTIVE) {
      throw new BusinessRuleException("Sender and recipient accounts must be active");
    }
    if (!sender.getCurrency().equals(receiver.getCurrency())) {
      throw new BusinessRuleException("Cross-currency transfers are not supported");
    }
    if (sender.getBalance().compareTo(amount) < 0) {
      throw new BusinessRuleException("Insufficient balance.");
    }
  }

  private void approveFlaggedTransaction(PaymentTransaction transaction) {
    Account sender = accounts.findByIdForUpdate(transaction.getFromAccount().getId()).orElseThrow();
    Account receiver = accounts.findByIdForUpdate(transaction.getToAccount().getId()).orElseThrow();

    if (sender.getBalance().compareTo(transaction.getAmount()) < 0) {
      throw new BusinessRuleException("Insufficient account balance to approve this transfer");
    }

    sender.debit(transaction.getAmount());
    receiver.credit(transaction.getAmount());
    transaction.approve();
  }

  private String nextReference() {
    return "PF-TXN-"
        + REFERENCE_TIME_FORMAT.format(Instant.now())
        + String.format("%03d", new Random().nextInt(1000));
  }
}
