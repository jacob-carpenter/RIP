package com.platonic.services.messenger;

import com.platonic.contracts.chat.messages.MessageRetrievalReply;
import com.platonic.contracts.chat.messages.MessageRetrievalRequest;
import com.platonic.models.chat.messages.Message;

import java.util.List;

public interface MessengerService {

    Message save(Message message);

    List<Long> getUserIdsWithChatMessages(Long chatId);

    MessageRetrievalReply getMessages(MessageRetrievalRequest messageRetrievalRequest);

}
