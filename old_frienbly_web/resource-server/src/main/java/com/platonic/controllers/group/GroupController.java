package com.platonic.controllers.group;

import com.platonic.contracts.group.AddMemberRequest;
import com.platonic.contracts.group.RemoveMemberRequest;
import com.platonic.models.group.Group;
import com.platonic.models.group.GroupDetails;
import com.platonic.models.group.GroupMember;
import com.platonic.models.group.GroupMemberType;
import com.platonic.models.user.UserContext;
import com.platonic.services.group.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("api/group")
public class GroupController {

    @Autowired
    private UserContext userContext;

    @Autowired
    private GroupService groupService;

    @RequestMapping(path="byrole/{role}", method = RequestMethod.GET)
    public GroupMember[] getRelatedGroupsByMemberType(@PathVariable int role) {
        return groupService.getGroupsByUserAndMemberType(userContext.getCurrentUser().getId(), GroupMemberType.valueOf(role));
    }

    @RequestMapping(path="leave/{groupId}", method = RequestMethod.POST)
    public boolean leaveGroup(@PathVariable long groupId) {
        return groupService.leaveGroup(userContext.getCurrentUser().getId(), groupId);
    }

    @RequestMapping(method = RequestMethod.GET)
    public GroupMember[] getRelatedGroupsByUser() {
        return groupService.getGroupsByUser(userContext.getCurrentUser().getId());
    }

    @RequestMapping(path="{groupId}", method = RequestMethod.GET)
    public Group getGroup(@PathVariable long groupId) {
        return groupService.getGroup(groupId);
    }

    @RequestMapping(method = RequestMethod.POST)
    public Group saveGroup(@RequestBody Group group) throws IllegalAccessException {
        return groupService.saveGroup(userContext.getCurrentUser().getId(), group);
    }

    @RequestMapping(path="details/{groupId}", method = RequestMethod.GET)
    public GroupDetails getGroupDetails(@PathVariable long groupId) {
        return groupService.getGroupDetails(groupId);
    }


    @RequestMapping(path="details/byIds", method = RequestMethod.POST)
    public List<GroupDetails> getByIds(@RequestBody List<Long> groupIds) {
        return groupService.getGroupDetails(groupIds);
    }

    @RequestMapping(path="details", method = RequestMethod.POST)
    public GroupDetails saveGroupDetails(@RequestBody GroupDetails groupDetails) throws IllegalAccessException {
        return groupService.saveGroupDetails(userContext.getCurrentUser().getId(), groupDetails);
    }

    @RequestMapping(path="members/{groupId}", method = RequestMethod.GET)
    public List<GroupMember> getGroupMembers(@PathVariable Long groupId) throws IllegalAccessException {
        return groupService.getGroupMembersByGroup(groupId);
    }

    @RequestMapping(path="members/add", method = RequestMethod.POST)
    public GroupMember addMember(@RequestBody AddMemberRequest addMemberRequest) throws IllegalAccessException {
        return groupService.addMember(addMemberRequest);
    }

    @RequestMapping(path="members/remove", method = RequestMethod.POST)
    public GroupMember saveGroupDetails(@RequestBody RemoveMemberRequest removeMemberRequest) throws IllegalAccessException {
        return groupService.removeMember(removeMemberRequest);
    }

}
