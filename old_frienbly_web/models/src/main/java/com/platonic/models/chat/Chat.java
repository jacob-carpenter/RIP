package com.platonic.models.chat;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "chats")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "chat_id", nullable = false, updatable = false)
    private Long chatId;

    @Column(name = "last_activity")
    private Timestamp lastActivity;

    @Column(name = "chat_type")
    private ChatType chatType;

    @Column(name = "is_active")
    private boolean active;

    @OneToMany(targetEntity = ChatMember.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "chat_id", insertable = false, updatable = false)
    private List<ChatMember> chatMembers;

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public Timestamp getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Timestamp lastActivity) {
        this.lastActivity = lastActivity;
    }

    public ChatType getChatType() {
        return chatType;
    }

    public void setChatType(ChatType chatType) {
        this.chatType = chatType;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<ChatMember> getChatMembers() {
        return chatMembers;
    }

    public void setChatMembers(List<ChatMember> chatMembers) {
        this.chatMembers = chatMembers;
    }

    public boolean equals(Object comp) {
        if (comp == null || !(comp instanceof Chat)) {
            return false;
        }

        return this.getChatId() == ((Chat) comp).getChatId();
    }

    public int hashCode() {
        return this.getChatId() != null ? this.getChatId().hashCode() : 0;
    }
}
