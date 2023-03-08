package com.platonic.models.requests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.platonic.models.group.GroupMemberType;

import javax.persistence.*;

@Entity
@Table(name = "requests")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "request_id", nullable = false, updatable = false)
    private Long requestId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "group_member_type")
    private GroupMemberType groupMemberType;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "target_group_id")
    private Long targetGroupId;

    @Column(name = "target_group_member_type")
    private GroupMemberType targetGroupMemberType;

    @Column(name = "request_type")
    private RequestType requestType;

    @Column(name = "active")
    private boolean active;

    @Column(name = "accepted")
    private boolean accepted;

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
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

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
    }

    public Long getTargetGroupId() {
        return targetGroupId;
    }

    public void setTargetGroupId(Long targetGroupId) {
        this.targetGroupId = targetGroupId;
    }

    public GroupMemberType getTargetGroupMemberType() {
        return targetGroupMemberType;
    }

    public void setTargetGroupMemberType(GroupMemberType targetGroupMemberType) {
        this.targetGroupMemberType = targetGroupMemberType;
    }

    public RequestType getRequestType() {
        return requestType;
    }

    public void setRequestType(RequestType requestType) {
        this.requestType = requestType;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isAccepted() {
        return accepted;
    }

    public void setAccepted(boolean accepted) {
        this.accepted = accepted;
    }
}
