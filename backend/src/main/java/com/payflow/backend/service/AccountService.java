package com.payflow.backend.service;

import com.payflow.backend.domain.Account;
import com.payflow.backend.domain.AccountStatus;
import com.payflow.backend.domain.AppUser;
import com.payflow.backend.dto.AccountResponse;
import com.payflow.backend.dto.AccountStatusRequest;
import com.payflow.backend.dto.AccountValidationResponse;
import com.payflow.backend.dto.CreateAccountRequest;
import com.payflow.backend.exception.BusinessRuleException;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.AccountRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

  private static final BigDecimal DEFAULT_INITIAL_BALANCE = new BigDecimal("5000.00");
  private static final SecureRandom RANDOM = new SecureRandom();

  private final AccountRepository accounts;
  private final UserLookupService users;

  public AccountService(AccountRepository accounts, UserLookupService users) {
    this.accounts = accounts;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<AccountResponse> listAccounts(Long userId) {
    users.requireUser(userId);
    return accounts.findByOwnerId(userId).stream().map(AccountResponse::from).toList();
  }

  @Transactional
  public AccountResponse createAccount(CreateAccountRequest request) {
    AppUser owner = users.findUser(request.userId());
    String currency =
        request.currency() == null || request.currency().isBlank()
            ? "INR"
            : request.currency().toUpperCase();
    if (!currency.matches("^[A-Z]{3}$"))
      throw new BusinessRuleException("Currency must be a three-letter code");
    BigDecimal initialBalance =
        request.initialBalance() == null ? DEFAULT_INITIAL_BALANCE : request.initialBalance();
    Account account =
        new Account(nextAccountNumber(), owner, request.type(), currency, initialBalance);
    return AccountResponse.from(accounts.save(account));
  }

  @Transactional(readOnly = true)
  public AccountValidationResponse validateRecipient(String accountNumber) {
    if (accountNumber == null || !accountNumber.matches("^[0-9]{12}$"))
      return new AccountValidationResponse(false, "Please enter a valid account number.", null);
    return accounts
        .findByAccountNumber(accountNumber)
        .map(
            account ->
                account.getStatus() == AccountStatus.ACTIVE
                    ? new AccountValidationResponse(
                        true, "Account found", account.getOwner().getFullName())
                    : new AccountValidationResponse(false, "Recipient account is inactive.", null))
        .orElseGet(() -> new AccountValidationResponse(false, "User not found.", null));
  }

  @Transactional(readOnly = true)
  public AccountResponse getAccount(UUID accountId) {
    return AccountResponse.from(findAccount(accountId));
  }

  @Transactional
  public AccountResponse updateAccountStatus(UUID accountId, AccountStatusRequest request) {
    Account account = findAccount(accountId);
    account.setStatus(request.status());
    return AccountResponse.from(account);
  }

  private Account findAccount(UUID accountId) {
    return accounts
        .findById(accountId)
        .orElseThrow(() -> new NotFoundException("Account not found"));
  }

  private String nextAccountNumber() {
    for (int attempt = 0; attempt < 20; attempt++) {
      String value = String.format("%012d", Math.floorMod(RANDOM.nextLong(), 1_000_000_000_000L));
      if (!accounts.existsByAccountNumber(value)) return value;
    }
    throw new BusinessRuleException("Could not generate a unique account number");
  }
}
