package com.platonic.models.group;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
public enum GroupMemberType {
    ADMIN, MEMBER;

    public static GroupMemberType valueOf(int value) {
        for (GroupMemberType groupMemberType : GroupMemberType.values()) {
            if (groupMemberType.ordinal() == value) {
                return groupMemberType;
            }
        }

        return GroupMemberType.MEMBER;
    }
}
