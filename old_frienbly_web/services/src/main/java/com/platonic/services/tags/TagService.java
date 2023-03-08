package com.platonic.services.tags;

import com.platonic.contracts.tags.TagCount;
import com.platonic.models.group.GroupTag;
import com.platonic.models.user.UserTag;

import java.util.List;

public interface TagService {

    List<TagCount> countTopTagUsageFilterByTagName(String search);

    List<UserTag> updateUserTags(long userId, List<UserTag> currentUserTags);

    List<GroupTag> updateGroupTags(long userId, long groupId, List<GroupTag> currentGroupTags) throws IllegalAccessException;
}
