package com.platonic.models.group;

import com.platonic.models.user.UserDetails;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "group_members")
@IdClass(GroupMember.GroupMemberPK.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GroupMember {

    @Id
    @Column(name = "group_id", nullable = false, updatable = false)
    private long groupId;

    @OneToOne(targetEntity = Group.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "group_id", insertable = false, updatable = false)
    private Group group;

    @OneToOne(targetEntity = GroupDetails.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "group_id", insertable = false, updatable = false)
    private GroupDetails groupDetails;

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private long userId;

    @OneToOne(targetEntity = UserDetails.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id", insertable = false, updatable = false)
    private UserDetails user;

    @Column(name = "member_type", nullable = false)
    private GroupMemberType groupMemberType;

    public GroupMember() {}

    public GroupMember(long userId, long groupId, GroupMemberType memberType) {
        this.userId = userId;
        this.groupId = groupId;
        this.groupMemberType = memberType;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public GroupDetails getGroupDetails() {
        return groupDetails;
    }

    public void setGroupDetails(GroupDetails groupDetails) {
        this.groupDetails = groupDetails;
    }

    public UserDetails getUser() {
        return user;
    }

    public void setUser(UserDetails user) {
        this.user = user;
    }

    public long getGroupId() {
        return groupId;
    }

    public void setGroupId(long groupId) {
        this.groupId = groupId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public GroupMemberType getGroupMemberType() {
        return groupMemberType;
    }

    public void setGroupMemberType(GroupMemberType groupMemberType) {
        this.groupMemberType = groupMemberType;
    }

    public static class GroupMemberPK implements Serializable {
        private long userId;
        private long groupId;

        public GroupMemberPK() {}

        public GroupMemberPK(long userId, long groupId) {
            this.userId = userId;
            this.groupId = groupId;
        }

        public long getUserId() {
            return userId;
        }

        public void setUserId(long userId) {
            this.userId = userId;
        }

        public long getGroupId() {
            return groupId;
        }

        public void setGroupId(long groupId) {
            this.groupId = groupId;
        }

        public boolean equals(Object comp) {
            if (comp == null || !(comp instanceof GroupMemberPK)) {
                return false;
            }

            GroupMemberPK compare = ((GroupMemberPK) comp);
            return this.getGroupId() == compare.getGroupId() && this.getUserId() == compare.getUserId();
        }

        public int hashCode() {
            return Objects.hash(getUserId(), getGroupId());
        }
    }
}
