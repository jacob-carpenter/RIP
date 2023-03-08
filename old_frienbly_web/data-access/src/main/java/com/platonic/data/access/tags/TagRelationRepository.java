package com.platonic.data.access.tags;

import com.platonic.contracts.search.SearchCriteria;
import com.platonic.models.tags.Tag;

import java.util.List;

public interface TagRelationRepository {
    List<Tag> getAllRelatedTags(List<SearchCriteria.ViewableTag> viewableTagList);
}
