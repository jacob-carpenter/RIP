package com.platonic.services.messenger.impl;

import com.platonic.contracts.chat.messages.MessageRetrievalReply;
import com.platonic.contracts.chat.messages.MessageRetrievalRequest;
import com.platonic.data.access.chat.message.MessageRepository;
import com.platonic.models.chat.messages.Message;
import com.platonic.services.messenger.ChatService;
import com.platonic.services.messenger.MessengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessengerServiceImpl implements MessengerService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ChatService chatService;

    @Override
    public Message save(Message message) {
        return messageRepository.save(message);
    }

    @Override
    public List<Long> getUserIdsWithChatMessages(Long chatId) {
        return messageRepository.findUserIdsWithChatMessages(chatId);
    }

    @Override
    public MessageRetrievalReply getMessages(MessageRetrievalRequest messageRetrievalRequest) {
        List<Message> earliestMessages = messageRepository.findEarliestMessageForChatId(messageRetrievalRequest.getChatId(), new PageRequest(0, 1));

        Message earliestMessage = null;
        if (earliestMessages != null && earliestMessages.size() > 0) {
            earliestMessage = earliestMessages.get(0);
        }

        Pageable pageable = new PageRequest(0, 100);
        if (messageRetrievalRequest.getEndDate() != null) {
            List<Message> messages = messageRepository.findByChatIdAndDateLessThanLimited(messageRetrievalRequest.getChatId(), messageRetrievalRequest.getEndDate(), pageable);
            return new MessageRetrievalReply(earliestMessage != null && messages.contains(earliestMessage), messages, messageRetrievalRequest.getChatId());
        }

        List<Message> messages = messageRepository.findByChatIdLimited(messageRetrievalRequest.getChatId(), pageable);
        return new MessageRetrievalReply(earliestMessage != null && messages.contains(earliestMessage), messages, messageRetrievalRequest.getChatId());
    }
}
