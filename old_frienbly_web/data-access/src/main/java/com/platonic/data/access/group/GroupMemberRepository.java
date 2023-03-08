package com.platonic.data.access.group;

import com.platonic.models.group.GroupMember;
import com.platonic.models.group.GroupMemberType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    GroupMember findOneByUserIdAndGroupId(long userId, long groupId);

    List<GroupMember> findAllByUserIdAndGroupMemberType(long userId, GroupMemberType groupMemberType);

    List<GroupMember> findAllByUserId(long userId);

    List<GroupMember> findAllByGroupId(long groupId);

    List<GroupMember> findAllByGroupIdIn(Collection<Long> groupIds);

    List<GroupMember> findAllByGroupIdAndGroupMemberType(Long targetGroupId, GroupMemberType targetGroupMemberType);
}
