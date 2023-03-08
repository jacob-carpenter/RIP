package com.platonic.data.access.user;

import com.platonic.models.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findOneByUsername(String username);
    User findOneByEmail(String email);
}
