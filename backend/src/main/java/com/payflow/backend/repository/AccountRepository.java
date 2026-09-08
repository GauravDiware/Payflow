package com.payflow.backend.repository;

import com.payflow.backend.domain.Account;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface AccountRepository extends JpaRepository<Account, UUID> {
  @EntityGraph(attributePaths = "owner")
  List<Account> findByOwnerId(Long ownerId);

  @EntityGraph(attributePaths = "owner")
  Optional<Account> findById(UUID id);

  Optional<Account> findByAccountNumber(String accountNumber);

  boolean existsByAccountNumber(String accountNumber);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select a from Account a join fetch a.owner where a.id=:id")
  Optional<Account> findByIdForUpdate(UUID id);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select a from Account a join fetch a.owner where a.accountNumber=:accountNumber")
  Optional<Account> findByAccountNumberForUpdate(String accountNumber);
}
