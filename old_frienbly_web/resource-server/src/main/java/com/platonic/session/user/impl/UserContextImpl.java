package com.platonic.session.user.impl;

import com.platonic.models.user.User;
import com.platonic.models.user.UserContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.stereotype.Component;

@Component
public class UserContextImpl implements UserContext {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2Authentication) {
            OAuth2Authentication authDetails = (OAuth2Authentication) authentication;
            if (authDetails.getUserAuthentication() != null && authDetails.getUserAuthentication().getPrincipal() instanceof User) {
                return (User) authDetails.getUserAuthentication().getPrincipal();
            }
        }

        return null;
    }
}
