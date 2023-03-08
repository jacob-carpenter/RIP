package com.platonic.controllers.tags;

import com.platonic.contracts.tags.TagCount;
import com.platonic.models.group.GroupTag;
import com.platonic.models.user.UserContext;
import com.platonic.models.user.UserTag;
import com.platonic.services.tags.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController()
@RequestMapping("api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @Autowired
    private UserContext userContext;

    @RequestMapping(path="topused", method = RequestMethod.GET)
    public List<TagCount> get(@RequestParam String search) {
        return tagService.countTopTagUsageFilterByTagName(search);
    }

    @RequestMapping(path="user", method = RequestMethod.POST)
    public List<UserTag> save(@RequestBody UserTag[] currentUserTags) {
        return tagService.updateUserTags(userContext.getCurrentUser().getId(), Arrays.asList(currentUserTags));
    }


    @RequestMapping(path="group/{groupId}", method = RequestMethod.POST)
    public List<GroupTag> save(@PathVariable long groupId, @RequestBody GroupTag[] currentGroupTags) throws IllegalAccessException {
        return tagService.updateGroupTags(userContext.getCurrentUser().getId(), groupId, Arrays.asList(currentGroupTags));
    }

}
