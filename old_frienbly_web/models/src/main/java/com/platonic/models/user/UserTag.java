package com.platonic.models.user;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.platonic.models.tags.Tag;
import com.platonic.models.tags.TagType;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "user_tags")
@IdClass(UserTag.UserTagPK.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserTag implements Serializable {

    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private long userId;

    @Id
    @Column(name = "tag_id", nullable = false, updatable = false)
    private long tagId;

    @OneToOne(targetEntity = Tag.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", insertable = false, updatable = false)
    private Tag tag;

    @Id
    @Column(name = "tag_type", nullable = false)
    private TagType tagType;

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
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

    public static class UserTagPK implements Serializable {
        private long userId;
        private long tagId;
        private TagType tagType;

        public UserTagPK() {}

        public UserTagPK(long userId, long tagId, TagType tagType) {
            this.userId = userId;
            this.tagId = tagId;
            this.tagType = tagType;
        }

        public long getUserId() {
            return userId;
        }

        public void setUserId(long userId) {
            this.userId = userId;
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
            if (comp == null || !(comp instanceof UserTagPK)) {
                return false;
            }

            UserTagPK compare = ((UserTagPK) comp);
            return this.getUserId() == compare.getUserId() && this.getTagId() == compare.getTagId() && this.getTagType() == compare.getTagType();
        }

        public int hashCode() {
            return Objects.hash(getTagId(), getUserId(), getTagType());
        }
    }
}
