package com.platonic.controllers.auth;

import com.platonic.contracts.auth.requests.RevocationRequest;
import com.platonic.models.user.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.provider.token.ConsumerTokenServices;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController()
@RequestMapping("oauth")
public class OAuthEndpointExtenderController {
    @Resource(name="tokenServices")
    private ConsumerTokenServices tokenServices;

    @RequestMapping(method = RequestMethod.POST, path = "token/revoke")
    @ResponseStatus(HttpStatus.OK)
    public void revokeToken(@RequestBody RevocationRequest revocationRequest) {
        tokenServices.revokeToken(revocationRequest.getAccessToken());
    }
}
