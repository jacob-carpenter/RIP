package com.platonic.data.access.requests;

import com.platonic.models.requests.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long>  {
    @Query(value = "SELECT r FROM Request r WHERE (r.userId = ?1 OR r.targetUserId = ?1) AND r.active = ?2 AND r.accepted = ?3")
    List<Request> findAllByUserIdOrTargetUserIdAndActiveAndAccepted(long userId, boolean active, boolean accepted);

    @Query(value = "SELECT r FROM Request r WHERE (r.groupId = ?1 OR r.targetGroupId = ?1) AND r.active = ?2 AND r.accepted = ?3")
    List<Request> findAllByGroupIdOrTargetGroupIdAndActiveAndAccepted(long groupId, boolean active, boolean accepted);
}
