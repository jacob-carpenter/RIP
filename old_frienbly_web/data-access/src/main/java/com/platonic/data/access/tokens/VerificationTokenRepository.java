package com.platonic.data.access.tokens;

import com.platonic.models.tokens.VerificationToken;
import com.platonic.models.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.Date;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    VerificationToken findByToken(String token);

    @Modifying
    @Transactional
    void deleteByExpiryDateBefore(Date expiryDate);
}