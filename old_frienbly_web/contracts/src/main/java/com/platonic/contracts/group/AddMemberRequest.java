package com.platonic.contracts.group;

import com.platonic.models.group.GroupMemberType;

public class AddMemberRequest {
    private Long groupId;
    private Long memberGroupId;
    private Long userId;
    private GroupMemberType groupMemberType;

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Long getMemberGroupId() {
        return memberGroupId;
    }

    public void setMemberGroupId(Long memberGroupId) {
        this.memberGroupId = memberGroupId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public GroupMemberType getGroupMemberType() {
        return groupMemberType;
    }

    public void setGroupMemberType(GroupMemberType groupMemberType) {
        this.groupMemberType = groupMemberType;
    }
}
