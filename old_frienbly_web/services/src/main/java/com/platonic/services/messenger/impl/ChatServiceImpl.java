package com.platonic.services.messenger.impl;

import com.platonic.contracts.chat.messages.MessageRetrievalReply;
import com.platonic.contracts.chat.messages.MessageRetrievalRequest;
import com.platonic.data.access.chat.ChatMemberRepository;
import com.platonic.data.access.chat.ChatRepository;
import com.platonic.data.access.chat.ChatViewRepository;
import com.platonic.data.access.group.GroupMemberRepository;
import com.platonic.models.chat.Chat;
import com.platonic.models.chat.ChatMember;
import com.platonic.models.chat.ChatType;
import com.platonic.models.chat.ChatView;
import com.platonic.models.group.GroupDetails;
import com.platonic.models.group.GroupMember;
import com.platonic.models.group.GroupMemberType;
import com.platonic.models.user.UserDetails;
import com.platonic.services.messenger.ChatService;
import com.platonic.services.messenger.MessengerService;
import com.platonic.services.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.*;

@Service
public class ChatServiceImpl implements ChatService {
    long DAY_IN_MS = 1000 * 60 * 60 * 24;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ChatMemberRepository chatMemberRepository;

    @Autowired
    private ChatViewRepository chatViewRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private MessengerService messengerService;

    @Autowired
    private UserService userService;

    @Override
    public List<Chat> get(Long userId) {
        List<Long> chatIds = new ArrayList<Long>();

        // User Chats
        List<ChatMember> userChats = chatMemberRepository.findByUserId(userId);
        for (ChatMember chatMember : userChats) {
            if (!chatIds.contains(chatMember.getChatId())) {
                chatIds.add(chatMember.getChatId());
            }
        }

        // Group Chats
        List<GroupMember> groupMembers = groupMemberRepository.findAllByUserId(userId);
        Map<Long, GroupMemberType> groupIdToMemberType = new HashMap<Long, GroupMemberType>();
        for (GroupMember groupMember : groupMembers) {
            groupIdToMemberType.put(groupMember.getGroup().getId(), groupMember.getGroupMemberType());
        }

        for (ChatMember chatMember : chatMemberRepository.findByGroupIdIn(groupIdToMemberType.keySet())) {
            GroupMemberType userGroupMemberType = groupIdToMemberType.get(chatMember.getGroupId());

            if (!chatIds.contains(chatMember.getChatId()) && (userGroupMemberType == GroupMemberType.ADMIN || chatMember.getGroupMemberType() == userGroupMemberType)) {
                chatIds.add(chatMember.getChatId());
            }
        }

        return returnActiveChats(chatRepository.findAllByChatIdInAndActive(chatIds, true));
    }

    private List<Chat> returnActiveChats(List<Chat> allChats) {
        List<Chat> updatedChats = new ArrayList<Chat>();
        List<Chat> activeChats = new ArrayList<Chat>();

        Timestamp twoWeekLookback = new Timestamp(new java.util.Date().getTime() - (14 * DAY_IN_MS));
        for (Chat chat : allChats) {
            if (chat.getChatType() == ChatType.GROUP || chat.getChatType() == ChatType.USER) {
                activeChats.add(chat);
                continue;
            }

            if (chat.isActive()) {
                if (twoWeekLookback.after(chat.getLastActivity())) {
                    chat.setActive(false);
                    updatedChats.add(chat);
                    continue;
                }

                activeChats.add(chat);
            }
        }

        if (updatedChats.size() > 0) {
            chatRepository.save(updatedChats);
        }

        return activeChats;
    }

    @Override
    public Chat save(Chat chat) {
        return chatRepository.save(chat);
    }

    @Override
    public Chat save(GroupDetails group) {
        Chat chat = new Chat();
        chat.setChatType(ChatType.GROUP);
        chat.setLastActivity(new Timestamp(new java.util.Date().getTime()));
        chat.setActive(true);

        chat = chatRepository.save(chat);

        ChatMember chatMember = new ChatMember();
        chatMember.setGroupId(group.getId());
        chatMember.setGroupMemberType(GroupMemberType.MEMBER);
        chatMember.setChatId(chat.getChatId());

        chatMemberRepository.save(chatMember);

        return chat;
    }

    @Override
    @Transactional
    public Chat getById(Long chatId) {
        Chat chat = chatRepository.getOne(chatId);

        // Hibernate it out
        chat.getChatMembers();

        return chat;
    }

    @Override
    public Chat getByDetails(Long userId, Chat chat) {
        List<Long> userIds = new ArrayList<Long>();
        Map<Long, GroupMemberType> groupIdToMemberType = new HashMap<Long, GroupMemberType>();

        for (ChatMember chatMember : chat.getChatMembers()) {
            if (chatMember.getUserId() != null) {
                userIds.add(chatMember.getUserId());
            } else if (chatMember.getGroupId() != null) {
                groupIdToMemberType.put(chatMember.getGroupId(), chatMember.getGroupMemberType());
            }
        }

        Map<Long, List<ChatMember>> possibleChatIdToMembers = new HashMap<Long, List<ChatMember>>();
        for (ChatMember chatMember : chatMemberRepository.findByUserIdIn(userIds)) {
            List<ChatMember> chatMembers = possibleChatIdToMembers.get(chatMember.getChatId());
            if (chatMembers == null) {
                chatMembers = new ArrayList<ChatMember>();

                possibleChatIdToMembers.put(chatMember.getChatId(), chatMembers);
            }
            chatMembers.add(chatMember);
        }

        if (groupIdToMemberType.size() > 0) {
            for (ChatMember chatMember : chatMemberRepository.findByGroupIdInAndChatIdIn(groupIdToMemberType.keySet(), possibleChatIdToMembers.keySet())) {
                GroupMemberType requestedGroupMemberType = groupIdToMemberType.get(chatMember.getGroupId());
                if (requestedGroupMemberType == chatMember.getGroupMemberType()) {
                    List<ChatMember> chatMembers = possibleChatIdToMembers.get(chatMember.getChatId());
                    if (chatMembers == null) {
                        chatMembers = new ArrayList<ChatMember>();

                        possibleChatIdToMembers.put(chatMember.getChatId(), chatMembers);
                    }
                    chatMembers.add(chatMember);
                }
            }
        }

        for (Map.Entry<Long, List<ChatMember>> chatIdToMembers : possibleChatIdToMembers.entrySet()) {
            if (chatIdToMembers.getValue().size() == chat.getChatMembers().size()) {
                return chatRepository.findOne(chatIdToMembers.getKey());
            }
        }

        return null;
    }

    @Override
    public Chat getOrCreate(Long userId, Chat chat) {
        Chat foundChat = getByDetails(userId, chat);
        if (foundChat != null) {
            return foundChat;
        }

        chat.setChatType(ChatType.USER_EPHEMERAL);
        chat.setLastActivity(new Timestamp(new java.util.Date().getTime()));
        chat.setActive(true);
        chat.setChatId(chatRepository.save(chat).getChatId());

        for (ChatMember chatMember : chat.getChatMembers()) {
            chatMember.setChatId(chat.getChatId());

            if (chatMember.getGroupId() != null) {
                chat.setChatType(ChatType.GROUP_EPHEMERAL);
            }
        }

        chat.setChatMembers(chatMemberRepository.save(chat.getChatMembers()));

        if (chat.getChatType() == ChatType.GROUP_EPHEMERAL) {
             chatRepository.save(chat);
        }

        return chat;
    }

    @Override
    public List<UserDetails> getMembers(Long chatId) {
        List<Long> chatUserIds = new ArrayList<Long>();

        Map<Long, GroupMemberType> groupIdToMemberType = new HashMap<Long, GroupMemberType>();

        List<ChatMember> chatMembers = chatMemberRepository.findByChatId(chatId);

        for (ChatMember chatMember : chatMembers) {
            if (chatMember.getUserId() != null && !chatUserIds.contains(chatMember.getUserId())) {
                chatUserIds.add(chatMember.getUserId());
            } else if (chatMember.getGroupId() != null) {
                groupIdToMemberType.put(chatMember.getGroupId(), chatMember.getGroupMemberType());
            }
        }

        if (groupIdToMemberType.size() > 0) {
            for (GroupMember groupMember : groupMemberRepository.findAllByGroupIdIn(groupIdToMemberType.keySet())) {
                GroupMemberType groupMemberType = groupIdToMemberType.get(groupMember.getGroup().getId());

                if (!chatUserIds.contains(groupMember.getUser().getId()) && (
                        groupMemberType == GroupMemberType.MEMBER || groupMember.getGroupMemberType() == groupMemberType)) {
                    chatUserIds.add(groupMember.getUser().getId());
                }
            }
        }

        return userService.getAllUserDetails(chatUserIds);
    }

    @Override
    public MessageRetrievalReply getMessages(MessageRetrievalRequest messageRetrievalRequest) {
        return messengerService.getMessages(messageRetrievalRequest);
    }

    @Override
    @Transactional
    public void viewedChat(Long userId, Long chatId) {
        ChatView chatView = chatViewRepository.findOneByUserIdAndChatId(userId, chatId);
        if (chatView == null) {
            chatView = new ChatView();
            chatView.setUserId(userId);
            chatView.setChatId(chatId);
        }
        chatView.setLastView(new Timestamp(new java.util.Date().getTime()));

        chatViewRepository.save(chatView);
    }

    @Override
    public List<Long> getChatIdsWithUnreadMessages(Long userId) {
        List<ChatView> chatViews = chatViewRepository.findAllByUserId(userId);
        Map<Long, Timestamp> chatIdToLastViewedTime = new HashMap<Long, Timestamp>();
        for (ChatView chatView : chatViews) {
            chatIdToLastViewedTime.put(chatView.getChatId(), chatView.getLastView());
        }

        List<Chat> chats = get(userId);
        List<Long> unreadChatIds = new ArrayList<Long>();
        for (Chat chat : chats) {
            Timestamp lastViewTime = chatIdToLastViewedTime.get(chat.getChatId());
            if (lastViewTime == null) {
                unreadChatIds.add(chat.getChatId());
            } else if (lastViewTime.before(chat.getLastActivity())) {
                unreadChatIds.add(chat.getChatId());
            }
        }

        return unreadChatIds;
    }

    @Override
    public void disableAllChatsByGroupId(Long groupId) {
        List<Long> chatIds = new ArrayList<Long>();
        for (ChatMember chatMember : chatMemberRepository.findByGroupIdIn(Collections.singletonList(groupId))) {
            if (!chatIds.contains(chatMember.getChatId())) {
                chatIds.add(chatMember.getChatId());
            }
        }

        if (chatIds.size() > 0) {
            for (Chat chat : chatRepository.findAll(chatIds)) {
                chat.setActive(false);
                chatRepository.save(chat);
            }
        }
    }
}
