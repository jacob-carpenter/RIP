package com.platonic.services.user.verification.impl;

import com.platonic.data.access.tokens.VerificationTokenRepository;
import com.platonic.data.access.user.UserRepository;
import com.platonic.models.tokens.VerificationToken;
import com.platonic.models.tokens.VerificationTokenType;
import com.platonic.models.user.User;
import com.platonic.services.user.verification.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Date;

@Service
public class VerificationServiceImpl implements VerificationService {

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${frienble.email.verification.url}")
    private String verificationUrl;

    @Override
    public VerificationToken getToken(String token) {
        return verificationTokenRepository.findByToken(token);
    }

    @Override
    public void createVerificationToken(User user, String token, String updatedEmail, VerificationTokenType tokenType) {
        VerificationToken myToken = new VerificationToken(user, token, tokenType);
        myToken.setNewEmail(updatedEmail);
        verificationTokenRepository.save(myToken);

        SimpleMailMessage email = new SimpleMailMessage();
        if (StringUtils.isEmpty(updatedEmail)) {
            email.setTo(user.getEmail());
        } else {
            email.setTo(updatedEmail);
        }
        email.setSubject("Frienbly Email Verification");

        if (tokenType == VerificationTokenType.ACCOUNT) {
            email.setText("Click here to activate your Frienbly account - " + verificationUrl + token);
        } else if (tokenType == VerificationTokenType.FORGOT_PASSWORD) {
            email.setText("Click here to reset your Frienbly password - " + verificationUrl + token);
        } else {
            email.setText("Here is the Frienbly validation link - " + verificationUrl + token);
        }
        mailSender.send(email);

        cleanupOldTokens();
    }

    @Override
    public boolean verifyAccountToken(String token) {
        boolean verified = false;

        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);

        if (verificationToken.getTokenType() == VerificationTokenType.ACCOUNT) {
            if ((new Date()).before(verificationToken.getExpiryDate())) {
                verificationToken.getUser().setEnabled(true);
                verified = true;
            }

            verificationTokenRepository.delete(verificationToken);
        }

        cleanupOldTokens();

        return verified;
    }

    @Override
    public boolean verifyForgotPasswordToken(String token, String newPassword) {
        boolean verified = false;

        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);

        if (verificationToken.getTokenType() == VerificationTokenType.FORGOT_PASSWORD) {
            if ((new Date()).before(verificationToken.getExpiryDate())) {
                verificationToken.getUser().setPassword(passwordEncoder.encode(newPassword));
                verified = true;
            }

            verificationTokenRepository.delete(verificationToken);
        }

        cleanupOldTokens();

        return verified;
    }

    @Override
    public boolean verifyChangeEmailToken(String token) {
        boolean verified = false;

        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);

        if (verificationToken.getTokenType() == VerificationTokenType.CHANGE_EMAIL) {
            if ((new Date()).before(verificationToken.getExpiryDate()) && !StringUtils.isEmpty(verificationToken.getNewEmail())) {
                verificationToken.getUser().setEmail(verificationToken.getNewEmail());
                verified = true;
            }

            verificationTokenRepository.delete(verificationToken);
        }

        cleanupOldTokens();

        return verified;
    }

    private void cleanupOldTokens() {
        verificationTokenRepository.deleteByExpiryDateBefore(new Date());
    }
}
