package com.platonic.contracts.chat.messages;

import com.platonic.models.chat.messages.Message;

import java.util.List;

public class MessageRetrievalReply {
    private boolean hasMoreHistoricalMessages;
    private List<Message> messages;
    private Long chatId;

    public MessageRetrievalReply() {}

    public MessageRetrievalReply(boolean hasMoreHistoricalMessages, List<Message> messages, Long chatId) {
        this.hasMoreHistoricalMessages = hasMoreHistoricalMessages;
        this.messages = messages;
        this.chatId = chatId;
    }

    public boolean isHasMoreHistoricalMessages() {
        return hasMoreHistoricalMessages;
    }

    public void setHasMoreHistoricalMessages(boolean hasMoreHistoricalMessages) {
        this.hasMoreHistoricalMessages = hasMoreHistoricalMessages;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
}
