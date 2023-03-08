package com.platonic.models.tags;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;

@Entity
@Table(name = "tags")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "tag_id", nullable = false, updatable = false)
    private long tagId;

    @Column(name = "display", nullable = false, unique = true)
    private String display;

    public Tag() {}

    public Tag(long tagId, String display) {
        this.tagId = tagId;
        this.display = display;
    }

    public long getTagId() {
        return tagId;
    }

    public void setTagId(long tagId) {
        this.tagId = tagId;
    }

    public String getDisplay() {
        return display;
    }

    public void setDisplay(String display) {
        this.display = display;
    }
}
