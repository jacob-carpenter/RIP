package com.platonic.contracts.tags;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.platonic.models.tags.Tag;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TagCount {
    private Tag tag;

    private long tagCount;

    public TagCount() {}

    public TagCount(long tagId, String tag, long tagCount) {
        this.tag = new Tag(tagId, tag);
        this.tagCount = tagCount;
    }

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
    }

    public long getTagCount() {
        return tagCount;
    }

    public void setTagCount(long tagCount) {
        this.tagCount = tagCount;
    }
}
