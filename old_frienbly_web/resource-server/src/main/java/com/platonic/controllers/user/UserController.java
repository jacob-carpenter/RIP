package com.platonic.controllers.user;

import com.platonic.contracts.user.replies.UserRegistrationReply;
import com.platonic.contracts.user.requests.PasswordChangeRequest;
import com.platonic.models.user.UserDetails;
import com.platonic.models.user.User;
import com.platonic.models.user.UserContext;
import com.platonic.models.user.attributes.Block;
import com.platonic.services.user.UserService;
import com.platonic.services.user.attributes.BlockService;
import com.platonic.services.user.attributes.ReportService;
import com.platonic.services.user.exceptions.UserPersistenceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserContext userContext;

    @Autowired
    private ReportService reportService;

    @Autowired
    private BlockService blockService;

    @RequestMapping(method = RequestMethod.GET, path = "tokencheck")
    @ResponseStatus(HttpStatus.OK)
    public boolean tokenCheck() {
        return userContext.getCurrentUser() != null;
    }

    @RequestMapping(path="byaccesstoken")
    public User getUser() {
        return userContext.getCurrentUser();
    }

    @RequestMapping(path="deactivate", method = RequestMethod.POST)
    public User deactivate() {
        userService.deactivateUser(userContext.getCurrentUser());

        return userContext.getCurrentUser();
    }

    @RequestMapping(path="register", method = RequestMethod.POST)
    public ResponseEntity<UserRegistrationReply> register(@RequestBody User userRequest) {
        try {
            userService.registerUser(userRequest);

            return new ResponseEntity<>(new UserRegistrationReply(), HttpStatus.CREATED);
        } catch (UserPersistenceException e) {
            return new ResponseEntity<>(new UserRegistrationReply(e.getExceptionType(), e.getErrorFieldType()), HttpStatus.BAD_REQUEST);
        }
    }

    @RequestMapping(path="details", method = RequestMethod.GET)
    public UserDetails get() {
        return userService.getUserDetails(userContext.getCurrentUser().getId());
    }

    @RequestMapping(path="details/{userId}", method = RequestMethod.GET)
    public UserDetails getById(@PathVariable Long userId) {
        return userService.getUserDetails(userId);
    }

    @RequestMapping(path="details/byIds", method = RequestMethod.POST)
    public List<UserDetails> getByIds(@RequestBody List<Long> userIds) {
        return userService.getUserDetails(userIds);
    }

    @RequestMapping(path="details", method = RequestMethod.POST)
    public UserDetails save(@RequestBody UserDetails userDetails) {
        return userService.saveUserDetails(userDetails);
    }

    @RequestMapping(path="forgotpassword", method = RequestMethod.POST)
    public boolean forgotPassword(@RequestBody String username) {
        return userService.forgotPassword(username);
    }

    @RequestMapping(path="changepassword", method = RequestMethod.POST)
    public boolean changePassword(@RequestBody PasswordChangeRequest passwordChangeRequest) {
        return userService.changePassword(userContext.getCurrentUser().getId(), passwordChangeRequest);
    }

    @RequestMapping(path="changeemail", method = RequestMethod.POST)
    public boolean changeEmail(@RequestBody String email) throws UserPersistenceException {
        return userService.changeEmail(userContext.getCurrentUser().getId(), email);
    }

    @RequestMapping(path="block/{userId}", method = RequestMethod.POST)
    public boolean block(@PathVariable Long userId) {
        return blockService.blockUser(userContext.getCurrentUser().getId(), userId);
    }

    @RequestMapping(path="unblock/{userId}", method = RequestMethod.POST)
    public boolean unblock(@PathVariable Long userId) {
        return blockService.unblockUser(userContext.getCurrentUser().getId(), userId);
    }

    @RequestMapping(path="block", method = RequestMethod.GET)
    public List<Block> getBlockedUsers() {
        return blockService.getBlocks(userContext.getCurrentUser().getId());
    }

    @RequestMapping(path="report/{userId}", method = RequestMethod.POST)
    public boolean report(@PathVariable Long userId, @RequestBody String reason) {
        return reportService.reportUser(userContext.getCurrentUser().getId(), userId, reason);
    }

}
