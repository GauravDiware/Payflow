package com.payflow.backend.service;

import com.payflow.backend.domain.AppUser;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtEncoder encoder;
  private final Duration lifetime;

  public JwtService(JwtEncoder encoder, @Value("${security.jwt.expiry:PT30M}") Duration lifetime) {
    this.encoder = encoder;
    this.lifetime = lifetime;
  }

  public String issue(AppUser user) {
    Instant now = Instant.now();
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer("payflow")
            .subject(user.getId().toString())
            .issuedAt(now)
            .expiresAt(now.plus(lifetime))
            .claim("email", user.getEmail())
            .claim("role", user.getRole().name())
            .build();
    JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
    return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
  }
}
