package com.platonic.services.tags.impl;

import com.platonic.contracts.tags.TagCount;
import com.platonic.data.access.group.GroupTagRepository;
import com.platonic.data.access.tags.TagRepository;
import com.platonic.data.access.user.UserTagRepository;
import com.platonic.models.group.GroupTag;
import com.platonic.models.tags.Tag;
import com.platonic.models.user.UserTag;
import com.platonic.services.group.GroupService;
import com.platonic.services.tags.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserTagRepository userTagRepository;

    @Autowired
    private GroupTagRepository groupTagRepository;

    @Autowired
    private GroupService groupService;

    @Override
    public List<TagCount> countTopTagUsageFilterByTagName(String search) {
        List<Object[]> rows = tagRepository.countTopUserTagUsageFilterByDisplayLimited(search, new PageRequest(0, 1000));

        List<TagCount> tagCounts = new ArrayList<TagCount>();
        for (Object[] row : rows) {
            tagCounts.add(new TagCount((Long) row[0], (String) row[1], (Long) row[2]));
        }

        rows = tagRepository.countTopGroupTagUsageFilterByDisplayLimited(search, new PageRequest(0, 1000));
        for (Object[] row : rows) {
            tagCounts.add(new TagCount((Long) row[0], (String) row[1], (Long) row[2]));
        }

        Map<String, TagCount> tagCountMap = new HashMap<String, TagCount>();
        for (TagCount tagCount : tagCounts) {
            TagCount foundTagCount = tagCountMap.get(tagCount.getTag().getDisplay());

            if (foundTagCount == null) {
                tagCountMap.put(tagCount.getTag().getDisplay(), tagCount);
            } else {
                foundTagCount.setTagCount(foundTagCount.getTagCount() + tagCount.getTagCount());
            }
        }

        return new ArrayList<TagCount>(tagCountMap.values());
    }

    @Override
    @Transactional
    public List<UserTag> updateUserTags(long userId, List<UserTag> currentUserTags) {
        List<String> requiredTagDisplays = new ArrayList<String>();
        Map<String, Collection<UserTag>> displayToUserTag = new HashMap<String, Collection<UserTag>>();

        for (UserTag userTag : currentUserTags) {
            userTag.setUserId(userId);
            userTag.getTag().setDisplay(cleanDisplay(userTag.getTag().getDisplay()));

            Collection<UserTag> userTags = displayToUserTag.get(userTag.getTag().getDisplay());
            if (userTags == null) {
                userTags = new ArrayList<UserTag>();
                displayToUserTag.put(userTag.getTag().getDisplay(), userTags);
            }
            userTags.add(userTag);

            requiredTagDisplays.add(userTag.getTag().getDisplay());
        }

        Map<String, Tag> persistedTagDisplayToTagMap = new HashMap<String, Tag>();
        for (Tag foundTag : tagRepository.findByDisplayInIgnoreCase(requiredTagDisplays)) {
            persistedTagDisplayToTagMap.put(foundTag.getDisplay(), foundTag);
        }

        List<Tag> missingTags = new ArrayList<Tag>();
        List<String> missingTagDisplays = new ArrayList<String>();
        for (UserTag userTag : currentUserTags) {
            Tag foundTag = persistedTagDisplayToTagMap.get(userTag.getTag().getDisplay());
            if (foundTag == null && !missingTagDisplays.contains(userTag.getTag().getDisplay())) {
                missingTagDisplays.add(userTag.getTag().getDisplay());
                missingTags.add(userTag.getTag());
            }
        }

        for (Tag persistedTag : tagRepository.save(missingTags)) {
            persistedTagDisplayToTagMap.put(persistedTag.getDisplay(), persistedTag);
        }

        for (Tag persistedTag : persistedTagDisplayToTagMap.values()) {
            Collection<UserTag> userTags = displayToUserTag.get(persistedTag.getDisplay());
            if (userTags != null) {
                for (UserTag userTag : userTags) {
                    userTag.setTagId(persistedTag.getTagId());
                    userTag.setTag(persistedTag);
                }
            }
        }

        userTagRepository.deleteAllByUserId(userId);
        return userTagRepository.save(currentUserTags);
    }

    @Override
    @Transactional
    public List<GroupTag> updateGroupTags(long userId, long groupId, List<GroupTag> currentGroupTags) throws IllegalAccessException {
        if (!groupService.canMakeChanges(userId, groupId)) {
            throw new IllegalAccessException(String.format("The user %s is not allowed to update group %s.", userId, groupId));
        }

        List<String> requiredTagDisplays = new ArrayList<String>();
        Map<String, Collection<GroupTag>> displayToGroupTag = new HashMap<String, Collection<GroupTag>>();

        for (GroupTag groupTag : currentGroupTags) {
            groupTag.setGroupId(groupId);
            groupTag.getTag().setDisplay(cleanDisplay(groupTag.getTag().getDisplay()));

            Collection<GroupTag> groupTags = displayToGroupTag.get(groupTag.getTag().getDisplay());
            if (groupTags == null) {
                groupTags = new ArrayList<GroupTag>();
                displayToGroupTag.put(groupTag.getTag().getDisplay(), groupTags);
            }
            groupTags.add(groupTag);

            requiredTagDisplays.add(groupTag.getTag().getDisplay());
        }

        Map<String, Tag> persistedTagDisplayToTagMap = new HashMap<String, Tag>();
        for (Tag foundTag : tagRepository.findByDisplayInIgnoreCase(requiredTagDisplays)) {
            persistedTagDisplayToTagMap.put(foundTag.getDisplay(), foundTag);
        }

        List<Tag> missingTags = new ArrayList<Tag>();
        List<String> missingTagDisplays = new ArrayList<String>();
        for (GroupTag groupTag : currentGroupTags) {
            Tag foundTag = persistedTagDisplayToTagMap.get(groupTag.getTag().getDisplay());
            if (foundTag == null && !missingTagDisplays.contains(groupTag.getTag().getDisplay())) {
                missingTagDisplays.add(groupTag.getTag().getDisplay());
                missingTags.add(groupTag.getTag());
            }
        }

        for (Tag persistedTag : tagRepository.save(missingTags)) {
            persistedTagDisplayToTagMap.put(persistedTag.getDisplay(), persistedTag);
        }

        for (Tag persistedTag : persistedTagDisplayToTagMap.values()) {
            Collection<GroupTag> groupTags = displayToGroupTag.get(persistedTag.getDisplay());
            if (groupTags != null) {
                for (GroupTag groupTag : groupTags) {
                    groupTag.setTagId(persistedTag.getTagId());
                    groupTag.setTag(persistedTag);
                }
            }
        }

        groupTagRepository.deleteAllByGroupId(groupId);
        return groupTagRepository.save(currentGroupTags);
    }

    private String cleanDisplay(String display) {
        if (display == null) {
            return null;
        }

        return display.toLowerCase().replace("  ", " ").trim();
    }
}
