package com.payflow.backend.repository;

import com.payflow.backend.domain.*;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

public interface TransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
  @EntityGraph(
      attributePaths = {"fromAccount", "fromAccount.owner", "toAccount", "toAccount.owner"})
  Optional<PaymentTransaction> findByReference(String reference);

  @EntityGraph(
      attributePaths = {"fromAccount", "fromAccount.owner", "toAccount", "toAccount.owner"})
  @Query(
      "select t from PaymentTransaction t where t.fromAccount.owner.id=:userId or"
          + " t.toAccount.owner.id=:userId")
  Page<PaymentTransaction> findVisibleToUser(Long userId, Pageable pageable);

  @EntityGraph(
      attributePaths = {"fromAccount", "fromAccount.owner", "toAccount", "toAccount.owner"})
  Page<PaymentTransaction> findByStatus(TransactionStatus status, Pageable pageable);

  @Override
  @EntityGraph(
      attributePaths = {"fromAccount", "fromAccount.owner", "toAccount", "toAccount.owner"})
  Page<PaymentTransaction> findAll(Pageable pageable);
}
