package com.platonic.models.tags;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;

@Entity
@Table(name = "flattened_tag_relations")
@JsonIgnoreProperties(ignoreUnknown = true)
public class TagRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "tag_relation_id", nullable = false, updatable = false)
    private long tagRelationId;

    @Column(name = "tag_id", nullable = false, updatable = false)
    private long tagId;

    @Column(name = "related_tag_id", nullable = false, updatable = false)
    private long relatedTagId;

    public long getTagRelationId() {
        return tagRelationId;
    }

    public void setTagRelationId(long tagRelationId) {
        this.tagRelationId = tagRelationId;
    }

    public long getTagId() {
        return tagId;
    }

    public void setTagId(long tagId) {
        this.tagId = tagId;
    }

    public long getRelatedTagId() {
        return relatedTagId;
    }

    public void setRelatedTagId(long relatedTagId) {
        this.relatedTagId = relatedTagId;
    }
}

