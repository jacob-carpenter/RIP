package com.platonic.data.access.group;

import com.platonic.models.group.GroupDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupDetailsRepository extends JpaRepository<GroupDetails, Long> {
}
