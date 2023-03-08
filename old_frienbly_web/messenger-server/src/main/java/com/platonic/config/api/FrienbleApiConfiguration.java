package com.platonic.config.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FrienbleApiConfiguration implements com.platonic.clients.configuration.FrienbleApiConfiguration{
    @Value("${frienble.api.url}")
    private String apiUrl;

    @Override
    public String getUrl() {
        return apiUrl;
    }
}
