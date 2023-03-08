package com.platonic.config.socket.io;

import com.corundumstudio.socketio.AuthorizationListener;
import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.List;

@Configuration
public class SocketIOConfig {
    @Value("${app.http.cors.origins.allowed}")
    private String corsOriginsAllowed;

    @Value("${socket.io.port}")
    private int socketIOPort;

    @Value("${socket.io.hostname}")
    private String socketIOHostName;

    @Value("${server.ssl.enabled}")
    private boolean sslEnabled;

    @Value("${server.ssl.signing.key}")
    private String sslSigningKey;

    @Value("classpath:keystore.p12")
    private Resource keystore;

    @Bean
    public SocketIOServer socketIOServer() throws IOException {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(socketIOHostName);
        config.setOrigin(corsOriginsAllowed);
        config.setPort(socketIOPort);

        if (sslEnabled) {
            config.setKeyStorePassword(sslSigningKey);
            config.setKeyStore(keystore.getInputStream());
        }

        config.setAuthorizationListener(new AuthorizationListener() {
            @Override
            public boolean isAuthorized(HandshakeData handshakeData) {
                List tokens = handshakeData.getUrlParams().get("token");
                if (tokens.size() == 1) {
                    return true;
                }
                return false;
            }
        });

        return new SocketIOServer(config);
    }
}
