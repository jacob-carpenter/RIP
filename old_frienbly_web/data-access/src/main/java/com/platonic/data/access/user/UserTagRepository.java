package com.platonic.data.access.user;

import com.platonic.models.user.UserTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserTagRepository extends JpaRepository<UserTag, Long> {

    void deleteAllByUserId(long userId);
}
