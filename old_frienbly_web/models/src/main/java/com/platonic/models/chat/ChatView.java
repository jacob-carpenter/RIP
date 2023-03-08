package com.platonic.models.chat;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "chat_views")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatView {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "chat_view_id", nullable = false, updatable = false)
    private Long chatViewId;

    @Column(name = "last_view")
    private Timestamp lastView;

    @Column(name = "user_id", updatable = false)
    private Long userId;

    @Column(name = "chat_id", nullable = false, updatable = false)
    private Long chatId;

    public Long getChatViewId() {
        return chatViewId;
    }

    public void setChatViewId(Long chatViewId) {
        this.chatViewId = chatViewId;
    }

    public Timestamp getLastView() {
        return lastView;
    }

    public void setLastView(Timestamp lastView) {
        this.lastView = lastView;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
}
