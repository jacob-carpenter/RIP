package com.platonic.services.messenger;

import com.platonic.contracts.chat.messages.MessageRetrievalReply;
import com.platonic.contracts.chat.messages.MessageRetrievalRequest;
import com.platonic.models.chat.Chat;
import com.platonic.models.chat.ChatView;
import com.platonic.models.group.GroupDetails;
import com.platonic.models.user.UserDetails;

import java.util.List;

public interface ChatService {
    List<Chat> get(Long userId);

    Chat save(Chat chat);

    Chat save(GroupDetails group);

    Chat getById(Long chatId);

    Chat getByDetails(Long userId, Chat chat);

    Chat getOrCreate(Long userId, Chat chat);

    List<UserDetails> getMembers(Long chatId);

    MessageRetrievalReply getMessages(MessageRetrievalRequest messageRetrievalRequest);

    void viewedChat(Long userId, Long chatId);

    List<Long> getChatIdsWithUnreadMessages(Long userId);

    void disableAllChatsByGroupId(Long groupId);
}
