package com.platonic.services.group.impl;

import com.platonic.contracts.group.AddMemberRequest;
import com.platonic.contracts.group.RemoveMemberRequest;
import com.platonic.data.access.group.GroupDetailsRepository;
import com.platonic.data.access.group.GroupMemberRepository;
import com.platonic.data.access.group.GroupRepository;
import com.platonic.models.chat.ChatMember;
import com.platonic.models.group.Group;
import com.platonic.models.group.GroupDetails;
import com.platonic.models.group.GroupMember;
import com.platonic.models.group.GroupMemberType;
import com.platonic.services.group.GroupService;
import com.platonic.services.messenger.ChatService;
import com.platonic.services.user.UserService;
import org.h2.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GroupServiceImpl implements GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupDetailsRepository groupDetailsRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private ChatService chatService;

    @Override
    public GroupMember[] getGroupsByUserAndMemberType(long userId, GroupMemberType memberType) {
        List<GroupMember> groupMembers = groupMemberRepository.findAllByUserIdAndGroupMemberType(userId, memberType);
        return groupMembers.toArray(new GroupMember[groupMembers.size()]);
    }

    @Override
    public GroupMember[] getGroupsByUser(long userId) {
        List<GroupMember> groupMembers = groupMemberRepository.findAllByUserId(userId);
        return groupMembers.toArray(new GroupMember[groupMembers.size()]);
    }

    @Override
    public Group getGroup(long groupId) {
        return groupRepository.getOne(groupId);
    }

    @Override
    public Group saveGroup(long currentUserId, Group group) throws IllegalAccessException {
        if (group.getId() == null) {
            group.setEnabled(true);
            Group savedGroup = groupRepository.save(group);

            GroupDetails groupDetails = new GroupDetails();
            groupDetails.setId(savedGroup.getId());
            groupDetails.setName(savedGroup.getName());
            groupDetailsRepository.save(groupDetails);

            groupMemberRepository.save(new GroupMember(currentUserId, savedGroup.getId(), GroupMemberType.ADMIN));

            chatService.save(groupDetails);

            return savedGroup;
        }

        if (!canMakeChanges(currentUserId, group.getId())) {
            throw new IllegalAccessException(String.format("The user %s is not allowed to update group %s.", currentUserId, group.getId()));
        }

        Group savedGroup = groupRepository.save(group);

        GroupDetails details = groupDetailsRepository.findOne(group.getId());
        if (!StringUtils.equals(details.getName(), savedGroup.getName())) {
            details.setName(group.getName());
            groupDetailsRepository.save(details);
        }

        return savedGroup;
    }

    @Override
    public GroupDetails getGroupDetails(Long groupId) {
        return groupDetailsRepository.getOne(groupId);
    }

    @Override
    public List<GroupDetails> getGroupDetails(List<Long> groupIds) {
        return groupDetailsRepository.findAll(groupIds);
    }

    @Override
    public GroupDetails saveGroupDetails(long currentUserId, GroupDetails groupDetails) throws IllegalAccessException {
        if (!canMakeChanges(currentUserId, groupDetails.getId())) {
            throw new IllegalAccessException(String.format("The user %s is not allowed to update group %s.", currentUserId, groupDetails.getId()));
        }

        GroupDetails savedDetails = groupDetailsRepository.save(groupDetails);

        Group group = groupRepository.getOne(groupDetails.getId());
        if (!StringUtils.equals(savedDetails.getName(), group.getName())) {
            group.setName(savedDetails.getName());
            groupRepository.save(group);
        }

        return savedDetails;
    }

    @Override
    public boolean canMakeChanges(long userId, long groupId) {
        GroupMember member =  groupMemberRepository.findOneByUserIdAndGroupId(userId, groupId);

        if (member != null) {
            return member.getGroupMemberType() == GroupMemberType.ADMIN;
        }

        return false;
    }

    @Override
    public boolean leaveGroup(long userId, long groupId) {
        GroupMember member = groupMemberRepository.findOneByUserIdAndGroupId(userId, groupId);

        if (member != null) {
            groupMemberRepository.delete(member);

            List<GroupMember> otherMembers = groupMemberRepository.findAllByGroupId(groupId);
            boolean containsActiveGroupUsers = false;
            boolean containsOtherAdmin = false;
            GroupMember newAdminUser = null;
            for (GroupMember otherMember : otherMembers) {
                if (otherMember.getUser().getId() != userId && otherMember.getUser().isEnabled()) {
                    containsActiveGroupUsers = true;

                    newAdminUser = otherMember;
                    if (otherMember.getGroupMemberType() == GroupMemberType.ADMIN) {
                        containsOtherAdmin = true;
                    }
                }
            }

            if (!containsOtherAdmin && newAdminUser != null) {
                newAdminUser.setGroupMemberType(GroupMemberType.ADMIN);
                groupMemberRepository.save(newAdminUser);
            }

            if (!containsActiveGroupUsers) {
                member.getGroup().setEnabled(false);
                disableGroupChats(member.getGroup());
                groupRepository.save(member.getGroup());
            }

            return true;
        }

        return false;
    }

    @Override
    @Transactional
    public List<GroupMember> getGroupMembersByGroup(Long groupId) {
        // Have to eager load dependencies for messenger socket io server.
        List<GroupMember> groupMembers = groupMemberRepository.findAllByGroupId(groupId);

        for (GroupMember groupMember : groupMembers) {
            groupMember.getUser();
            groupMember.getGroup();
        }

        return groupMembers;
    }

    @Override
    @Transactional
    public List<GroupMember> getGroupMembersByGroupAndType(Long groupId, GroupMemberType groupMemberType) {
        // Have to eager load dependencies for messenger socket io server.
        List<GroupMember> groupMembers = groupMemberRepository.findAllByGroupIdAndGroupMemberType(groupId, groupMemberType);

        for (GroupMember groupMember : groupMembers) {
            groupMember.getUser();
            groupMember.getGroup();
        }

        return groupMembers;
    }

    @Override
    public GroupMember addMember(AddMemberRequest addMemberRequest) {
        if (addMemberRequest.getMemberGroupId() != null) {
            combineGroups(addMemberRequest.getGroupId(), addMemberRequest.getMemberGroupId());

            return new GroupMember();
        }

        GroupMember currentGroupMember = groupMemberRepository.findOneByUserIdAndGroupId(addMemberRequest.getUserId(), addMemberRequest.getGroupId());
        if (currentGroupMember != null) {
            if (currentGroupMember.getGroupMemberType() != addMemberRequest.getGroupMemberType()) {
                currentGroupMember.setGroupMemberType(addMemberRequest.getGroupMemberType());
                return groupMemberRepository.save(currentGroupMember);
            }
        } else {
            GroupMember groupMember = new GroupMember();
            groupMember.setGroupMemberType(addMemberRequest.getGroupMemberType());
            groupMember.setUserId(addMemberRequest.getUserId());
            groupMember.setGroupId(addMemberRequest.getGroupId());
            return groupMemberRepository.save(groupMember);
        }

        return currentGroupMember;
    }

    private void combineGroups(Long groupId, Long memberGroupId) {
        List<GroupMember> groupToCombineMembers = groupMemberRepository.findAllByGroupId(memberGroupId);

        List<GroupMember> groupMembers = groupMemberRepository.findAllByGroupId(groupId);

        List<GroupMember> groupMembersToSave = new ArrayList<GroupMember>();
        List<GroupMember> groupMembersToRemove = new ArrayList<GroupMember>();

        for (GroupMember groupToCombineMember : groupToCombineMembers) {
            boolean found = false;
            for (GroupMember groupMember : groupMembers) {
                if (groupMember.getUserId() == groupToCombineMember.getUserId()) {
                    found = true;
                }
            }

            groupMembersToRemove.add(groupToCombineMember);
            if (!found) {
                GroupMember groupMember = new GroupMember();

                groupMember.setGroupMemberType(GroupMemberType.MEMBER);
                groupMember.setGroupId(groupId);
                groupMember.setUserId(groupToCombineMember.getUserId());

                groupMembersToSave.add(groupMember);
            }
        }

        groupMemberRepository.delete(groupMembersToRemove);
        groupMemberRepository.save(groupMembersToSave);

        // Disable memberGroup
        Group memberGroup = groupRepository.findOne(memberGroupId);
        memberGroup.setEnabled(false);
        disableGroupChats(memberGroup);
        groupRepository.save(memberGroup);
    }

    private void disableGroupChats(Group group) {
        chatService.disableAllChatsByGroupId(group.getId());
    }

    @Override
    public GroupMember removeMember(RemoveMemberRequest removeMemberRequest) {
        GroupMember currentGroupMember = groupMemberRepository.findOneByUserIdAndGroupId(removeMemberRequest.getUserId(), removeMemberRequest.getGroupId());

        if (currentGroupMember != null) {
            groupMemberRepository.delete(currentGroupMember);
        }

        return currentGroupMember;
    }
}
