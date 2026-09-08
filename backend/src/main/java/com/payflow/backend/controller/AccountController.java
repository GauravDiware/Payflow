package com.payflow.backend.controller;

import com.payflow.backend.dto.AccountResponse;
import com.payflow.backend.dto.AccountStatusRequest;
import com.payflow.backend.dto.AccountValidationResponse;
import com.payflow.backend.dto.CreateAccountRequest;
import com.payflow.backend.service.AccountService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AccountController {

  private final AccountService accountService;

  public AccountController(AccountService accountService) {
    this.accountService = accountService;
  }

  @GetMapping("/users/{userId}/accounts")
  @PreAuthorize("#userId.toString() == authentication.name")
  List<AccountResponse> list(@PathVariable Long userId) {
    return accountService.listAccounts(userId);
  }

  @GetMapping("/accounts/{id}")
  @PreAuthorize("@authorization.canViewAccount(#id, authentication)")
  AccountResponse get(@PathVariable UUID id) {
    return accountService.getAccount(id);
  }

  @PostMapping("/accounts")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("#request.userId.toString() == authentication.name")
  AccountResponse create(@Valid @RequestBody CreateAccountRequest request) {
    return accountService.createAccount(request);
  }

  @GetMapping("/accounts/validate/{accountNumber}")
  AccountValidationResponse validateRecipient(@PathVariable String accountNumber) {
    return accountService.validateRecipient(accountNumber);
  }

  @PatchMapping("/admin/accounts/{id}/status")
  AccountResponse updateStatus(
      @PathVariable UUID id, @Valid @RequestBody AccountStatusRequest request) {
    return accountService.updateAccountStatus(id, request);
  }
}
