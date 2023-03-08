package com.platonic.config.security.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@EnableResourceServer
@Configuration
public class OAuth2ResourceServerConfig extends ResourceServerConfigurerAdapter {
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Value("${frienble.client.id}")
    private String frienbleClientId;

    @Autowired
    private TokenStore tokenStore;

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers(HttpMethod.POST,"/oauth/token").anonymous()
                .antMatchers(HttpMethod.POST, "/api/user/register").anonymous()
                .antMatchers(HttpMethod.POST, "/api/user/forgotpassword").anonymous()
                .antMatchers(HttpMethod.POST, "/api/verification/**").anonymous()
                .antMatchers(HttpMethod.GET, "/api/verification/**").anonymous()
                .anyRequest().authenticated().and()
                .antMatcher("/api/**").addFilter(new UsernamePasswordAuthenticationFilter());
    }

    @Override
    public void configure(final ResourceServerSecurityConfigurer resources) {
        resources.resourceId(frienbleClientId).tokenStore(tokenStore);
    }
}
