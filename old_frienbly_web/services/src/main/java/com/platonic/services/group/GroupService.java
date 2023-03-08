package com.platonic.services.group;

import com.platonic.contracts.group.AddMemberRequest;
import com.platonic.contracts.group.RemoveMemberRequest;
import com.platonic.models.group.Group;
import com.platonic.models.group.GroupDetails;
import com.platonic.models.group.GroupMember;
import com.platonic.models.group.GroupMemberType;

import java.util.List;

public interface GroupService {
    GroupMember[] getGroupsByUserAndMemberType(long userId, GroupMemberType memberType);

    GroupMember[] getGroupsByUser(long userId);

    Group getGroup(long groupId);

    Group saveGroup(long currentUserId, Group group) throws IllegalAccessException ;

    GroupDetails getGroupDetails(Long groupId);

    List<GroupDetails> getGroupDetails(List<Long> groupIds);

    GroupDetails saveGroupDetails(long currentUserId, GroupDetails groupDetails) throws IllegalAccessException ;

    boolean canMakeChanges(long userId, long groupId);

    boolean leaveGroup(long userId, long groupId);

    List<GroupMember> getGroupMembersByGroup(Long groupId);

    List<GroupMember> getGroupMembersByGroupAndType(Long groupId, GroupMemberType groupMemberType);

    GroupMember addMember(AddMemberRequest addMemberRequest);

    GroupMember removeMember(RemoveMemberRequest removeMemberRequest);
}
