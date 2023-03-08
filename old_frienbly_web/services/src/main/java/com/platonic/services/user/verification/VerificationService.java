package com.platonic.services.user.verification;

import com.platonic.models.tokens.VerificationToken;
import com.platonic.models.tokens.VerificationTokenType;
import com.platonic.models.user.User;

public interface VerificationService {
    VerificationToken getToken(String token);

    void createVerificationToken(User user, String token, String newEmail, VerificationTokenType tokenType);

    boolean verifyAccountToken(String token);

    boolean verifyForgotPasswordToken(String token, String newPassword);

    boolean verifyChangeEmailToken(String token);
}
