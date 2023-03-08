package com.platonic.models.group;


import com.platonic.models.tags.Tag;
import com.platonic.models.tags.TagType;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "group_tags")
@IdClass(GroupTag.GroupTagPK.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class GroupTag implements Serializable {

    @Id
    @Column(name = "group_id", nullable = false, updatable = false)
    private long groupId;

    @Id
    @Column(name = "tag_id", nullable = false, updatable = false)
    private long tagId;

    @OneToOne(targetEntity = Tag.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", insertable = false, updatable = false)
    private Tag tag;

    @Id
    @Column(name = "tag_type", nullable = false)
    private TagType tagType;

    public long getGroupId() {
        return groupId;
    }

    public void setGroupId(long groupId) {
        this.groupId = groupId;
    }

    public long getTagId() {
        return tagId;
    }

    public void setTagId(long tagId) {
        this.tagId = tagId;
    }

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }

    public TagType getTagType() {
        return tagType;
    }

    public void setTagType(TagType tagType) {
        this.tagType = tagType;
    }

    public static class GroupTagPK implements Serializable {
        private long groupId;
        private long tagId;
        private TagType tagType;

        public GroupTagPK() {}

        public GroupTagPK(long groupId, long tagId, TagType tagType) {
            this.groupId = groupId;
            this.tagId = tagId;
            this.tagType = tagType;
        }

        public long getGroupId() {
            return groupId;
        }

        public void setGroupId(long groupId) {
            this.groupId = groupId;
        }

        public long getTagId() {
            return tagId;
        }

        public void setTagId(long tagId) {
            this.tagId = tagId;
        }

        public TagType getTagType() {
            return tagType;
        }

        public void setTagType(TagType tagType) {
            this.tagType = tagType;
        }

        public boolean equals(Object comp) {
            if (comp == null || !(comp instanceof GroupTagPK)) {
                return false;
            }

            GroupTagPK compare = ((GroupTagPK) comp);
            return this.getGroupId() == compare.getGroupId() && this.getTagId() == compare.getTagId() && this.getTagType() == compare.getTagType();
        }

        public int hashCode() {
            return Objects.hash(getTagId(), getGroupId(), getTagType());
        }
    }
}

