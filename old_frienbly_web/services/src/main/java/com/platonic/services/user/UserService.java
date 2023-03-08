package com.platonic.services.user;

import com.platonic.contracts.user.requests.PasswordChangeRequest;
import com.platonic.models.user.UserDetails;
import com.platonic.models.user.User;
import com.platonic.services.user.exceptions.UserPersistenceException;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.sql.Timestamp;
import java.util.List;

public interface UserService extends UserDetailsService {
    void setLockStatus(boolean lockStatus, Long targettedUserId);

    void deactivateUser(User currentUser);

    User registerUser(User user) throws UserPersistenceException;

    UserDetails getUserDetails(Long userId);

    List<UserDetails> getUserDetails(List<Long> userIds);

    UserDetails saveUserDetails(UserDetails userDetails);

    boolean forgotPassword(String username);

    boolean changePassword(long userId, PasswordChangeRequest passwordChangeRequest);

    boolean changeEmail(long userId, String email) throws UserPersistenceException;

    List<UserDetails> getAllUserDetails(List<Long> userIds);

    void setLastActivity(Long userId, Timestamp activityTime);
}