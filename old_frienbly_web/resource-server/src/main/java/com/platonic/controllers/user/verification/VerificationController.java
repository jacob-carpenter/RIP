package com.platonic.controllers.user.verification;

import com.platonic.models.tokens.VerificationToken;
import com.platonic.services.user.verification.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController()
@RequestMapping("api/verification")
public class VerificationController {

    @Autowired
    private VerificationService verificationService;

    @RequestMapping(path="{token}", method = RequestMethod.GET)
    public VerificationToken get(@PathVariable String token) {
        return verificationService.getToken(token);
    }

    @RequestMapping(path="verify/account/{token}", method = RequestMethod.POST)
    public boolean verifyToken(@PathVariable String token) {
        return verificationService.verifyAccountToken(token);
    }

    @RequestMapping(path="verify/forgotpassword/{token}", method = RequestMethod.POST)
    public boolean verifyForgotPasswordToken(@PathVariable String token, @RequestBody String newPassword) {
        return verificationService.verifyForgotPasswordToken(token, newPassword);
    }

    @RequestMapping(path="verify/changeemail/{token}", method = RequestMethod.POST)
    public boolean verifyChangeEmailToken(@PathVariable String token) {
        return verificationService.verifyChangeEmailToken(token);
    }
}
