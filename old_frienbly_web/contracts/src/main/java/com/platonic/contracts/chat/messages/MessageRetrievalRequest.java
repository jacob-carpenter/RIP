package com.platonic.contracts.chat.messages;

import java.sql.Timestamp;

public class MessageRetrievalRequest {
    private Long chatId;
    private Timestamp endDate;

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public Timestamp getEndDate() {
        return endDate;
    }

    public void setEndDate(Timestamp endDate) {
        this.endDate = endDate;
    }
}
