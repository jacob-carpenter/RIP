package com.platonic.services.user.impl;

import com.platonic.contracts.user.UserFieldType;
import com.platonic.contracts.user.requests.PasswordChangeRequest;
import com.platonic.data.access.user.UserDetailsRepository;
import com.platonic.data.access.user.UserRepository;
import com.platonic.models.user.UserDetails;
import com.platonic.models.tokens.VerificationTokenType;
import com.platonic.models.user.User;
import com.platonic.services.user.UserService;
import com.platonic.services.user.exceptions.UserPersistenceException;
import com.platonic.contracts.exceptions.ExceptionType;
import com.platonic.services.user.verification.VerificationService;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Service("userDetailsService")
public class UserServiceImpl implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsRepository userDetailsRepository;

    @Value("${frienble.email.verification.required}")
    private boolean verificationRequired;

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findOneByUsername(username);
    }

    @Override
    public void setLockStatus(boolean lockStatus, Long targettedUserId) {
        User user = userRepository.findOne(targettedUserId);

        user.setLocked(lockStatus);

        userRepository.save(user);
    }

    @Override
    public void deactivateUser(User currentUser) {
        currentUser.setEnabled(false);

        userRepository.save(currentUser);
    }

    @Override
    public User registerUser(User user) throws UserPersistenceException {
        try {
            User foundEmailUser = userRepository.findOneByEmail(user.getEmail());

            if (foundEmailUser == null) {
                // New User
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                user.setEnabled(!verificationRequired);
                User savedUser = userRepository.save(user);
                if (verificationRequired) {
                    verificationService.createVerificationToken(savedUser, UUID.randomUUID().toString(), null, VerificationTokenType.ACCOUNT);
                }

                try {
                    user.getUserDetails().setId(user.getId());
                    saveUserDetails(user.getUserDetails());
                } catch (Exception exception) {
                    // Cleanup a partial write.
                    userRepository.delete(user);
                    throw exception;
                }
                return savedUser;
            } else if (!foundEmailUser.isEnabled() && !foundEmailUser.isLocked()) {
                // Disabled unlocked user
                foundEmailUser.setUsername(user.getUsername());
                foundEmailUser.setEmail(user.getEmail());
                foundEmailUser.setEnabled(!verificationRequired);
                foundEmailUser.setPassword(passwordEncoder.encode(user.getPassword()));
                User savedUser = userRepository.save(foundEmailUser);

                if (verificationRequired) {
                    verificationService.createVerificationToken(savedUser, UUID.randomUUID().toString(), null, VerificationTokenType.ACCOUNT);
                }

                savedUser.setUserDetails(getUserDetails(savedUser.getId()));
                savedUser.getUserDetails().setBirthdate(user.getUserDetails().getBirthdate());
                savedUser.getUserDetails().setLatitude(user.getUserDetails().getLatitude());
                savedUser.getUserDetails().setLongitude(user.getUserDetails().getLongitude());
                savedUser.getUserDetails().setStreet(user.getUserDetails().getStreet());
                savedUser.getUserDetails().setCity(user.getUserDetails().getCity());
                savedUser.getUserDetails().setProvince(user.getUserDetails().getProvince());
                savedUser.getUserDetails().setCountry(user.getUserDetails().getCountry());
                savedUser.getUserDetails().setPostalCode(user.getUserDetails().getPostalCode());
                savedUser.getUserDetails().setSex(user.getUserDetails().getSex());
                savedUser.getUserDetails().setOnlineOnly(user.getUserDetails().isOnlineOnly());
                savedUser.getUserDetails().setLookingForIndividuals(user.getUserDetails().isLookingForIndividuals());
                savedUser.getUserDetails().setLookingForGroups(user.getUserDetails().isLookingForGroups());
                saveUserDetails(savedUser.getUserDetails());

                return savedUser;
            } else {
                // Dupe user
                throw new UserPersistenceException(ExceptionType.DUPLICATION, UserFieldType.EMAIL);
            }
        } catch (Exception exception) {
            if (exception instanceof UserPersistenceException) {
                throw (UserPersistenceException) exception;
            }
            throw getUserPersistenceException(exception);
        }
    }

    @Override
    public UserDetails getUserDetails(Long userId) {
        return userDetailsRepository.findOne(userId);
    }

    @Override
    public List<UserDetails> getUserDetails(List<Long> userIds) {
        return userDetailsRepository.findAll(userIds);
    }

    @Override
    public UserDetails saveUserDetails(UserDetails userDetails) {
        userDetails.setLastActivity(new Timestamp(new java.util.Date().getTime()));
        return userDetailsRepository.save(userDetails);
    }

    @Override
    public boolean forgotPassword(String username) {
        User user = userRepository.findOneByUsername(username);
        if (user != null) {
            verificationService.createVerificationToken(user, UUID.randomUUID().toString(), null, VerificationTokenType.FORGOT_PASSWORD);
            return true;
        }
        return false;
    }

    @Override
    public boolean changePassword(long userId, PasswordChangeRequest passwordChangeRequest) {
        User user = userRepository.findOne(userId);

        if (user != null && passwordEncoder.matches(passwordChangeRequest.getCurrentPassword(), user.getPassword())) {
            user.setPassword(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean changeEmail(long userId, String email) throws UserPersistenceException {
        User foundUser = userRepository.findOneByEmail(email);
        if (foundUser != null && foundUser.getId() != userId) {
            throw new UserPersistenceException(ExceptionType.DUPLICATION, UserFieldType.EMAIL);
        }

        User currentUser = userRepository.findOne(userId);
        if (currentUser != null) {
            verificationService.createVerificationToken(currentUser, UUID.randomUUID().toString(), email, VerificationTokenType.CHANGE_EMAIL);
            return true;
        }
        return false;
    }

    @Override
    public List<UserDetails> getAllUserDetails(List<Long> userIds) {
        return userDetailsRepository.findAll(userIds);
    }

    @Override
    @Transactional
    public void setLastActivity(Long userId, Timestamp activityTime) {
        UserDetails userDetails = userDetailsRepository.getOne(userId);
        userDetails.setLastActivity(activityTime);
        userDetailsRepository.save(userDetails);
    }

    private UserPersistenceException getUserPersistenceException(Exception exception) {
        UserPersistenceException userPersistenceException = new UserPersistenceException(exception);
        userPersistenceException.setExceptionType(ExceptionType.UNKNOWN);
        if (exception instanceof DataIntegrityViolationException) {
            DataIntegrityViolationException dataIntegrityViolationException = (DataIntegrityViolationException) exception;

            if (dataIntegrityViolationException.getCause() != null && dataIntegrityViolationException.getCause() instanceof ConstraintViolationException) {
                ConstraintViolationException constraintViolationException = (ConstraintViolationException) dataIntegrityViolationException.getCause();

                userPersistenceException.setExceptionType(ExceptionType.DUPLICATION);
                if ("username".equals(constraintViolationException.getConstraintName())) {
                    userPersistenceException.setErrorFieldType(UserFieldType.USERNAME);
                } else if ("email".equals(constraintViolationException.getConstraintName())) {
                    userPersistenceException.setErrorFieldType(UserFieldType.EMAIL);
                }
            }
        }

        return userPersistenceException;
    }
}