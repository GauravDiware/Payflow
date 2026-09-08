package com.payflow.backend.controller;

import com.payflow.backend.dto.BeneficiaryResponse;
import com.payflow.backend.dto.CreateBeneficiaryRequest;
import com.payflow.backend.service.BeneficiaryService;
import com.payflow.backend.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/{userId}/beneficiaries")
public class BeneficiaryController {

  private final BeneficiaryService beneficiaryService;
  private final PaymentService paymentService;

  public BeneficiaryController(
      BeneficiaryService beneficiaryService, PaymentService paymentService) {
    this.beneficiaryService = beneficiaryService;
    this.paymentService = paymentService;
  }

  @GetMapping
  @PreAuthorize("#userId.toString() == authentication.name")
  public List<BeneficiaryResponse> listBeneficiaries(@PathVariable Long userId) {
    return beneficiaryService.listBeneficiaries(userId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("#userId.toString() == authentication.name")
  public BeneficiaryResponse createBeneficiary(
      @PathVariable Long userId, @Valid @RequestBody CreateBeneficiaryRequest request) {
    return paymentService.addBeneficiary(userId, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("#userId.toString() == authentication.name")
  public void deleteBeneficiary(@PathVariable Long userId, @PathVariable UUID id) {
    beneficiaryService.deleteBeneficiary(userId, id);
  }
}
