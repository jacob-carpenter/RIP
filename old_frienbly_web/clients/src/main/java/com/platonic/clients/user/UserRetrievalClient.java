package com.platonic.clients.user;

import com.platonic.models.user.User;

public interface UserRetrievalClient {
    User getUserByAccessToken(String accessToken);
}
