package com.platonic.models.chat;

import com.platonic.models.group.GroupMemberType;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;

@Entity
@Table(name = "chat_members")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChatMember {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "chat_member_id", nullable = false, updatable = false)
    private Long chatMemberId;

    @Column(name = "chat_id", nullable = false, updatable = false)
    private Long chatId;

    @Column(name = "user_id", updatable = false)
    private Long userId;

    @Column(name = "group_id", updatable = false)
    private Long groupId;

    @Column(name = "group_member_type", updatable = false)
    private GroupMemberType groupMemberType;

    public Long getChatMemberId() {
        return chatMemberId;
    }

    public void setChatMemberId(Long chatMemberId) {
        this.chatMemberId = chatMemberId;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public GroupMemberType getGroupMemberType() {
        return groupMemberType;
    }

    public void setGroupMemberType(GroupMemberType groupMemberType) {
        this.groupMemberType = groupMemberType;
    }
}
