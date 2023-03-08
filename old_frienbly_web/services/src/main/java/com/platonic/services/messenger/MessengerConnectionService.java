package com.platonic.services.messenger;

import com.platonic.models.user.User;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface MessengerConnectionService {

    User getUser(String accessToken) throws IllegalAccessException;

    Long getUserIdBySessionId(UUID uuid);

    void addSessionId(Long userId, UUID sessionId);

    void removeSessionId(UUID sessionId);

    List<UUID> getSessionIds(List<Long> userIds);

    List<Long> getActiveUserIds(List<Long> userIds);

    void setSelectedChatId(Long chatId, UUID sessionId);

    Collection<UUID> getActiveSessionsForSelectedChatId(Long chatId);

    void listenForUsers(UUID sessionId, Collection<Long> userIdsForWhichWeListen);

    List<UUID> getSessionsToNotifyForActivity(Long userId);
}
