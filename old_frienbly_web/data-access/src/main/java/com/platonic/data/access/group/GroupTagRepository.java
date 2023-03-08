package com.platonic.data.access.group;

import com.platonic.models.group.GroupTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupTagRepository extends JpaRepository<GroupTag, Long> {
    void deleteAllByGroupId(long groupId);
}
