package com.platonic.modules;

import com.corundumstudio.socketio.HandshakeData;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIONamespace;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.platonic.contracts.chat.ChatSelection;
import com.platonic.models.chat.Chat;
import com.platonic.models.chat.ChatMember;
import com.platonic.models.chat.messages.Message;
import com.platonic.models.events.Event;
import com.platonic.models.events.EventRsvp;
import com.platonic.models.group.GroupMember;
import com.platonic.models.group.GroupMemberType;
import com.platonic.models.requests.Request;
import com.platonic.models.user.User;
import com.platonic.services.events.EventService;
import com.platonic.services.group.GroupService;
import com.platonic.services.messenger.ChatService;
import com.platonic.services.messenger.MessengerConnectionService;
import com.platonic.services.messenger.MessengerService;
import com.platonic.services.requests.RequestService;
import com.platonic.services.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.*;

@Component
public class MessengerModule {
    private static final Logger log = LoggerFactory.getLogger(MessengerModule.class);

    private final SocketIONamespace namespace;

    @Autowired
    private MessengerService messengerService;

    @Autowired
    private RequestService requestService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private EventService eventService;

    @Autowired
    private MessengerConnectionService messengerConnectionService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    @Autowired
    public MessengerModule(SocketIOServer server) {
        this.namespace = server.addNamespace("");
        this.namespace.addConnectListener(onConnected());
        this.namespace.addDisconnectListener(onDisconnected());
        this.namespace.addEventListener("message", Message.class, onChatReceived());
        this.namespace.addEventListener("chat_selected", ChatSelection.class, onChatSelected());
        this.namespace.addEventListener("request", Request.class, onRequestReceived());
        this.namespace.addEventListener("event_rsvp", EventRsvp.class, onEventRsvpReceived());
    }

    @Transactional
    private DataListener<Message> onChatReceived() {
        return (client, data, ackSender) -> {
            Long userId = messengerConnectionService.getUserIdBySessionId(client.getSessionId());
            if (userId == null) {
                log.error("Client[{}] - Could not send message '{}'", client.getSessionId().toString(), data);
                return;
            }
            Timestamp activityTime = new Timestamp(new java.util.Date().getTime());
            userService.setLastActivity(userId, activityTime);

            data.setUserId(userId);
            data.setSentDateTime(activityTime);
            data = messengerService.save(data);
            chatService.viewedChat(userId, data.getChatId());

            Chat chat = chatService.getById(data.getChatId());
            chat.setLastActivity(data.getSentDateTime());
            chat.setActive(true);
            chatService.save(chat);

            Set<Long> targettedUserIds = new HashSet<>();
            for (ChatMember chatMember : chat.getChatMembers()) {
                if (chatMember.getUserId() != null) {
                    targettedUserIds.add(chatMember.getUserId());
                } else {
                    List<GroupMember> groupMembers = null;
                    if (chatMember.getGroupMemberType() == GroupMemberType.MEMBER) {
                        groupMembers = groupService.getGroupMembersByGroup(chatMember.getGroupId());
                    } else {
                        groupMembers = groupService.getGroupMembersByGroupAndType(chatMember.getGroupId(), chatMember.getGroupMemberType());
                    }

                    for (GroupMember groupMember : groupMembers) {
                        if (groupMember.getUser().isEnabled()) {
                            targettedUserIds.add(groupMember.getUser().getId());
                        }
                    }
                }
            }
            targettedUserIds.add(userId);

            List<UUID> activeConnections = messengerConnectionService.getSessionIds(new ArrayList<>(targettedUserIds));

            for (UUID sessionId : activeConnections) {
                SocketIOClient userClient = namespace.getClient(sessionId);
                if (userClient != null) {
                    userClient.sendEvent("message", data);
                }
            }

            log.debug("Client[{}] - Received messenger message '{}'", client.getSessionId().toString(), data);
        };
    }

    @Transactional
    private DataListener<ChatSelection> onChatSelected() {
        return (client, data, ackSender) -> {
            Long userId = messengerConnectionService.getUserIdBySessionId(client.getSessionId());
            if (userId == null) {
                log.error("Client[{}] - Could not send message '{}'", client.getSessionId().toString(), data);
                return;
            }
            Timestamp activityTime = new Timestamp(new java.util.Date().getTime());
            userService.setLastActivity(userId, activityTime);

            chatService.viewedChat(userId, data.getChatId());
            Chat chat = chatService.getById(data.getChatId());
            Set<Long> targettedUserIds = new HashSet<>();
            for (ChatMember chatMember : chat.getChatMembers()) {
                if (chatMember.getUserId() != null) {
                    targettedUserIds.add(chatMember.getUserId());
                } else {
                    List<GroupMember> groupMembers = null;
                    if (chatMember.getGroupMemberType() == GroupMemberType.MEMBER) {
                        groupMembers = groupService.getGroupMembersByGroup(chatMember.getGroupId());
                    } else {
                        groupMembers = groupService.getGroupMembersByGroupAndType(chatMember.getGroupId(), chatMember.getGroupMemberType());
                    }

                    for (GroupMember groupMember : groupMembers) {
                        if (groupMember.getUser().isEnabled()) {
                            targettedUserIds.add(groupMember.getUser().getId());
                        }
                    }
                }
            }
            targettedUserIds.add(userId);

            messengerConnectionService.listenForUsers(client.getSessionId(), targettedUserIds);

            List<Long> activeUserIds = messengerConnectionService.getActiveUserIds(new ArrayList<>(targettedUserIds));

            client.sendEvent("active_users", activeUserIds);

            log.debug("Client[{}] - Received messenger chat selection '{}'", client.getSessionId().toString(), data);
        };
    }

    @Transactional
    private DataListener<Request> onRequestReceived() {
        return (client, data, ackSender) -> {
            Long userId = messengerConnectionService.getUserIdBySessionId(client.getSessionId());
            if (userId == null) {
                log.error("Client[{}] - Could not send request '{}'", client.getSessionId().toString(), data);
                return;
            }
            Timestamp activityTime = new Timestamp(new java.util.Date().getTime());
            userService.setLastActivity(userId, activityTime);

            if (data.getUserId() == null) {
                data.setUserId(userId);
            }
            if (!data.isAccepted()) {
                data.setActive(true);
            }

            data = requestService.save(data);

            Set<Long> targettedUserIds = new HashSet<>();

            if (data.getUserId() != null) {
                targettedUserIds.add(data.getUserId());
            }
            if (data.getGroupId() != null) {
                List<GroupMember> groupMembers = null;
                if (data.getGroupMemberType() == GroupMemberType.MEMBER) {
                    groupMembers = groupService.getGroupMembersByGroup(data.getGroupId());
                } else {
                    groupMembers = groupService.getGroupMembersByGroupAndType(data.getGroupId(), data.getGroupMemberType());
                }

                for (GroupMember groupMember : groupMembers) {
                    if (groupMember.getUser().isEnabled()) {
                        targettedUserIds.add(groupMember.getUser().getId());
                    }
                }
            }

            if (data.getTargetUserId() != null) {
                targettedUserIds.add(data.getTargetUserId());
            }
            if (data.getTargetGroupId() != null) {
                List<GroupMember> groupMembers = null;
                if (data.getTargetGroupMemberType() == GroupMemberType.MEMBER) {
                    groupMembers = groupService.getGroupMembersByGroup(data.getTargetGroupId());
                } else {
                    groupMembers = groupService.getGroupMembersByGroupAndType(data.getTargetGroupId(), data.getTargetGroupMemberType());
                }

                for (GroupMember groupMember : groupMembers) {
                    if (groupMember.getUser().isEnabled()) {
                        targettedUserIds.add(groupMember.getUser().getId());
                    }
                }
            }

            List<UUID> activeConnections = messengerConnectionService.getSessionIds(new ArrayList<>(targettedUserIds));
            for (UUID sessionId : activeConnections) {
                SocketIOClient userClient = namespace.getClient(sessionId);
                if (userClient != null) {
                    userClient.sendEvent("request", data);
                }
            }

            log.debug("Client[{}] - Received messenger request '{}'", client.getSessionId().toString(), data);
        };
    }

    @Transactional
    private DataListener<EventRsvp> onEventRsvpReceived() {
        return (client, data, ackSender) -> {
            Long userId = messengerConnectionService.getUserIdBySessionId(client.getSessionId());
            if (userId == null) {
                log.error("Client[{}] - Could not send request '{}'", client.getSessionId().toString(), data);
                return;
            }
            Timestamp activityTime = new Timestamp(new java.util.Date().getTime());
            userService.setLastActivity(userId, activityTime);

            eventService.saveEventRsvp(data);

            Event event = eventService.getEventById(data.getEventId());
            Chat chat = chatService.getById(event.getTargettedChatId());
            Set<Long> targettedUserIds = new HashSet<>();
            for (ChatMember chatMember : chat.getChatMembers()) {
                if (chatMember.getUserId() != null) {
                    targettedUserIds.add(chatMember.getUserId());
                } else {
                    List<GroupMember> groupMembers = null;
                    if (chatMember.getGroupMemberType() == GroupMemberType.MEMBER) {
                        groupMembers = groupService.getGroupMembersByGroup(chatMember.getGroupId());
                    } else {
                        groupMembers = groupService.getGroupMembersByGroupAndType(chatMember.getGroupId(), chatMember.getGroupMemberType());
                    }

                    for (GroupMember groupMember : groupMembers) {
                        if (groupMember.getUser().isEnabled()) {
                            targettedUserIds.add(groupMember.getUser().getId());
                        }
                    }
                }
            }
            targettedUserIds.add(userId);

            List<UUID> activeConnections = messengerConnectionService.getSessionIds(new ArrayList<>(targettedUserIds));

            for (UUID sessionId : activeConnections) {
                SocketIOClient userClient = namespace.getClient(sessionId);
                if (userClient != null) {
                    userClient.sendEvent("event_rsvp", data);
                }
            }

            log.debug("Client[{}] - Received messenger event rsvp '{}'", client.getSessionId().toString(), data);
        };
    }

    private ConnectListener onConnected() {
        return client -> {
            User user = getUserAccess(client, client.getHandshakeData().getSingleUrlParam("token"));
            Timestamp activityTime = new Timestamp(new java.util.Date().getTime());
            userService.setLastActivity(user.getId(), activityTime);

            messengerConnectionService.addSessionId(user.getId(), client.getSessionId());

            HandshakeData handshakeData = client.getHandshakeData();

            this.namespace.getBroadcastOperations().sendEvent("connect");

            List<UUID> activeConnections = messengerConnectionService.getSessionsToNotifyForActivity(user.getId());
            for (UUID sessionId : activeConnections) {
                SocketIOClient userClient = namespace.getClient(sessionId);
                if (userClient != null) {
                    userClient.sendEvent("logged_in", user.getId());
                }
            }
            log.debug("Client[{}] - Connected to messenger module through '{}'", client.getSessionId().toString(), handshakeData.getUrl());
        };
    }

    private User getUserAccess(SocketIOClient client, String token) {
        User user = null;
        try {
            user = messengerConnectionService.getUser(token);
        } catch (IllegalAccessException e) {}

        if (user == null) {
            client.sendEvent("access_denied");
            client.disconnect();
        }

        return user;
    }

    private DisconnectListener onDisconnected() {
        return client -> {
            Long userId = messengerConnectionService.getUserIdBySessionId(client.getSessionId());
            List<UUID> activeConnections = messengerConnectionService.getSessionsToNotifyForActivity(userId);
            messengerConnectionService.removeSessionId(client.getSessionId());

            this.namespace.getBroadcastOperations().sendEvent("disconnect");

            for (UUID sessionId : activeConnections) {
                SocketIOClient userClient = namespace.getClient(sessionId);
                if (userClient != null) {
                    userClient.sendEvent("logged_out", userId);
                }
            }
            log.debug("Client[{}] - Disconnected from messenger module.", client.getSessionId().toString());
        };
    }
}
