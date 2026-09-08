package com.payflow.backend.service;

import com.payflow.backend.domain.AppUser;
import com.payflow.backend.exception.NotFoundException;
import com.payflow.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserLookupService {
  private final UserRepository users;

  public UserLookupService(UserRepository users) {
    this.users = users;
  }

  public void requireUser(Long userId) {
    if (!users.existsById(userId)) throw new NotFoundException("User not found");
  }

  public AppUser findUser(Long userId) {
    return users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
  }
}
