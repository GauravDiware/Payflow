package com.payflow.backend.config;

import com.payflow.backend.repository.AccountRepository;
import com.payflow.backend.repository.TransactionRepository;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("authorization")
public class AuthorizationService {
  private final AccountRepository accounts;
  private final TransactionRepository transactions;

  public AuthorizationService(AccountRepository accounts, TransactionRepository transactions) {
    this.accounts = accounts;
    this.transactions = transactions;
  }

  public boolean canViewAccount(UUID accountId, Authentication authentication) {
    if (isAdmin(authentication)) return true;
    return accounts
        .findById(accountId)
        .map(account -> account.getOwner().getId().toString().equals(authentication.getName()))
        .orElse(false);
  }

  public boolean canViewTransaction(String reference, Authentication authentication) {
    if (isAdmin(authentication)) return true;
    return transactions
        .findByReference(reference)
        .map(
            transaction ->
                transaction
                        .getFromAccount()
                        .getOwner()
                        .getId()
                        .toString()
                        .equals(authentication.getName())
                    || transaction
                        .getToAccount()
                        .getOwner()
                        .getId()
                        .toString()
                        .equals(authentication.getName()))
        .orElse(false);
  }

  private boolean isAdmin(Authentication authentication) {
    return authentication.getAuthorities().stream()
        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
  }
}
