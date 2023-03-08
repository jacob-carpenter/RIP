package com.platonic.services.search.impl;

import com.platonic.contracts.group.GroupDetailsLite;
import com.platonic.contracts.search.SearchCriteria;
import com.platonic.contracts.search.SearchResult;
import com.platonic.contracts.user.UserDetailsLite;
import com.platonic.data.access.group.GroupDetailsRepository;
import com.platonic.data.access.group.GroupMemberRepository;
import com.platonic.data.access.search.SearchRepository;
import com.platonic.data.access.tags.TagRelationRepository;
import com.platonic.data.access.user.UserDetailsRepository;
import com.platonic.models.chat.Chat;
import com.platonic.models.chat.ChatMember;
import com.platonic.models.chat.ChatType;
import com.platonic.models.group.GroupDetails;
import com.platonic.models.group.GroupMember;
import com.platonic.models.tags.Tag;
import com.platonic.models.user.UserDetails;
import com.platonic.services.messenger.ChatService;
import com.platonic.services.search.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchServiceImpl implements SearchService {
    @Autowired
    private SearchRepository searchRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Autowired
    private GroupDetailsRepository groupDetailsRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private TagRelationRepository tagRelationRepository;

    @Autowired
    private ChatService chatService;

    @Override
    public SearchResult[] search(SearchCriteria searchCriteria) {
        if (searchCriteria.getTags().size() > 0) {
            searchCriteria.getTags().addAll(findRelatedTags(searchCriteria.getTags()));
        }

        SearchResult[] results = searchRepository.search(searchCriteria);

        // TODO Filter out people/groups with active messaging with current group/user?
        Map<SearchResult.EntityType, List<Long>> relatedEntities = new HashMap<SearchResult.EntityType, List<Long>>();
        if (searchCriteria.getExecutedByGroupId() != null) {
            List<Long> relatedGroupIds = new ArrayList<Long>();
            relatedGroupIds.add(searchCriteria.getExecutedByGroupId());
            relatedEntities.put(SearchResult.EntityType.GROUP, relatedGroupIds);

            List<Long> relatedUserIds = new ArrayList<Long>();
            relatedEntities.put(SearchResult.EntityType.USER, relatedUserIds);
            for (GroupMember member : groupMemberRepository.findAllByGroupId(searchCriteria.getExecutedByGroupId())) {
                relatedUserIds.add(member.getUser().getId());
            }
        } else {
            List<Long> relatedUserIds = new ArrayList<Long>();
            relatedUserIds.add(searchCriteria.getExecutedByUserId());
            for (Chat chat : chatService.get(searchCriteria.getExecutedByUserId())) {
                if (chat.getChatType() == ChatType.USER) {
                    for (ChatMember chatMember : chat.getChatMembers()) {
                        if (chatMember.getUserId() != null && chatMember.getUserId() != searchCriteria.getExecutedByUserId()) {
                            relatedUserIds.add(chatMember.getUserId());
                        }
                    }
                }
            }
            relatedEntities.put(SearchResult.EntityType.USER, relatedUserIds);

            List<Long> relatedGroupIds = new ArrayList<Long>();
            relatedEntities.put(SearchResult.EntityType.GROUP, relatedGroupIds);
            for (GroupMember member : groupMemberRepository.findAllByUserId(searchCriteria.getExecutedByUserId())) {
                relatedGroupIds.add(member.getGroup().getId());
            }
        }

        Map<Long, SearchResult> userIdToSearchResult = new HashMap<Long, SearchResult>();
        Map<Long, SearchResult> groupIdToSearchResult = new HashMap<Long, SearchResult>();
        for (SearchResult result : results) {
            List<Long> relatedUserIds = relatedEntities.get(SearchResult.EntityType.USER);
            List<Long> relatedGroupIds = relatedEntities.get(SearchResult.EntityType.GROUP);

            if (result.getEntityType() == SearchResult.EntityType.USER &&
                    (relatedUserIds == null || !relatedUserIds.contains(result.getEntityId()))) {
                userIdToSearchResult.put(result.getEntityId(), result);
            } else if (result.getEntityType() == SearchResult.EntityType.GROUP &&
                    (relatedGroupIds == null || !relatedGroupIds.contains(result.getEntityId()))) {
                groupIdToSearchResult.put(result.getEntityId(), result);
            }
        }

        List<UserDetails> userDetails = userDetailsRepository.findAll(userIdToSearchResult.keySet());
        List<GroupDetails> groupDetails = groupDetailsRepository.findAll(groupIdToSearchResult.keySet());
        for (UserDetails userDetail : userDetails) {
            SearchResult result = userIdToSearchResult.get(userDetail.getId());
            if (result != null) {
                result.setUser(new UserDetailsLite(userDetail));
            }
        }
        for (GroupDetails groupDetail : groupDetails) {
            SearchResult result = groupIdToSearchResult.get(groupDetail.getId());
            if (result != null) {
                result.setGroup(new GroupDetailsLite(groupDetail));
            }
        }

        return results;
    }

    public List<SearchCriteria.ViewableTag> findRelatedTags(List<SearchCriteria.ViewableTag> tags) {
        List<SearchCriteria.ViewableTag> foundTags = new ArrayList<SearchCriteria.ViewableTag>();

        for (Tag tag : tagRelationRepository.getAllRelatedTags(tags)) {
            SearchCriteria.ViewableTag viewableTag = new SearchCriteria.ViewableTag();
            viewableTag.setDisplay(tag.getDisplay());
            viewableTag.setValue(tag.getDisplay());
            foundTags.add(viewableTag);
        }

        return foundTags;
    }
}
