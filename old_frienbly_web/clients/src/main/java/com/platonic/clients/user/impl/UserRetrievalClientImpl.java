package com.platonic.clients.user.impl;

import com.platonic.clients.configuration.FrienbleApiConfiguration;
import com.platonic.clients.user.UserRetrievalClient;
import com.platonic.models.user.User;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class UserRetrievalClientImpl implements UserRetrievalClient {
    private RestTemplate restTemplate;

    @Autowired
    private FrienbleApiConfiguration apiConfiguration;

    public UserRetrievalClientImpl() {
        CloseableHttpClient httpClient = HttpClients.custom().setSSLHostnameVerifier(new NoopHostnameVerifier()).build();
        HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
        requestFactory.setHttpClient(httpClient);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    @Override
    public User getUserByAccessToken(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);

        HttpEntity<String> entity = new HttpEntity<String>(headers);

        return restTemplate.exchange(
                String.format("%s/user/byaccesstoken", apiConfiguration.getUrl(), accessToken),
                HttpMethod.GET,
                entity,
                User.class
        ).getBody();
    }
}
