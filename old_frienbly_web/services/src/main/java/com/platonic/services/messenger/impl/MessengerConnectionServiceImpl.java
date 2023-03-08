package com.platonic.services.messenger.impl;

import com.platonic.clients.user.UserRetrievalClient;
import com.platonic.models.user.User;
import com.platonic.services.messenger.MessengerConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MessengerConnectionServiceImpl implements MessengerConnectionService {
    private Map<Long, Collection<UUID>> userIdToSessionIdMap = new ConcurrentHashMap<Long, Collection<UUID>>();
    private Map<UUID, Long> sessionIdToUserIdMap = new ConcurrentHashMap<UUID, Long>();

    private Map<UUID, Collection<Long>> sessionToListenedForUserIds = new ConcurrentHashMap<UUID, Collection<Long>>();

    private Map<UUID, Long> sessionIdToActiveChatId = new ConcurrentHashMap<UUID, Long>();
    private Map<Long, Collection<UUID>> chatIdToActiveSessionIds = new ConcurrentHashMap<Long, Collection<UUID>>();

    @Autowired
    private UserRetrievalClient userRetrievalClient;

    @Override
    @Cacheable("MessengerConnectionServiceImpl_GetUser")
    public User getUser(String accessToken) throws IllegalAccessException {
        return userRetrievalClient.getUserByAccessToken(accessToken);
    }

    @Override
    public Long getUserIdBySessionId(UUID uuid) {
        return sessionIdToUserIdMap.get(uuid);
    }

    @Override
    public void addSessionId(Long userId, UUID sessionId) {
        Collection<UUID> userSessionIds = userIdToSessionIdMap.getOrDefault(userId, new ConcurrentLinkedQueue<UUID>());
        userSessionIds.add(sessionId);

        userIdToSessionIdMap.put(userId, userSessionIds);
        sessionIdToUserIdMap.put(sessionId, userId);
    }

    @Override
    public void removeSessionId(UUID sessionId) {
        Long userId = sessionIdToUserIdMap.get(sessionId);

        Collection<UUID> userSessionIds = userIdToSessionIdMap.get(userId);
        if (userSessionIds != null) {
            userSessionIds.remove(sessionId);

            if (userSessionIds.size() == 0) {
                userIdToSessionIdMap.remove(userId);
            }
        }

        sessionIdToUserIdMap.remove(sessionId);
        sessionToListenedForUserIds.remove(sessionId);

        Long chatId = sessionIdToActiveChatId.remove(sessionId);
        if (chatId != null) {
            Collection<UUID> chatSessionIds = chatIdToActiveSessionIds.get(chatId);
            if (chatSessionIds != null && chatSessionIds.contains(sessionId)) {
                chatSessionIds.remove(sessionId);

                if (chatSessionIds.size() == 0) {
                    chatIdToActiveSessionIds.remove(chatId);
                }
            }
        }
    }

    @Override
    public List<UUID> getSessionIds(List<Long> userIds) {
        List<UUID> sessionIds = new ArrayList<UUID>();

        for (Long userId : userIds) {
            Collection<UUID> userSessionIds = userIdToSessionIdMap.get(userId);

            if (userSessionIds != null && userSessionIds.size() > 0) {
                sessionIds.addAll(userSessionIds);
            }
        }

        return sessionIds;
    }

    @Override
    public List<Long> getActiveUserIds(List<Long> userIds) {
        List<Long> foundUserIds = new ArrayList<Long>();

        for (Long userId : userIds) {
            Collection<UUID> userSessionIds = userIdToSessionIdMap.get(userId);

            if (userSessionIds != null && userSessionIds.size() > 0) {
                foundUserIds.add(userId);
            }
        }

        return foundUserIds;
    }

    @Override
    public void setSelectedChatId(Long chatId, UUID sessionId) {
        Collection<UUID> sessionIds = chatIdToActiveSessionIds.getOrDefault(chatId, new ConcurrentLinkedQueue<UUID>());
        sessionIds.add(sessionId);

        chatIdToActiveSessionIds.put(chatId, sessionIds);
        sessionIdToActiveChatId.put(sessionId, chatId);
    }

    @Override
    public Collection<UUID> getActiveSessionsForSelectedChatId(Long chatId) {
        return chatIdToActiveSessionIds.get(chatId);
    }

    @Override
    public void listenForUsers(UUID sessionId, Collection<Long> userIdsForWhichWeListen) {
        this.sessionToListenedForUserIds.put(sessionId, userIdsForWhichWeListen);
    }

    @Override
    public List<UUID> getSessionsToNotifyForActivity(Long userId) {
        List<UUID> sessionIdsToNotify = new ArrayList<UUID>();
        for (Map.Entry<UUID, Collection<Long>> sessionToListenedForUsers : sessionToListenedForUserIds.entrySet()) {
            if (sessionToListenedForUsers.getValue().contains(userId)) {
                sessionIdsToNotify.add(sessionToListenedForUsers.getKey());
            }
        }

        return sessionIdsToNotify;
    }
}
