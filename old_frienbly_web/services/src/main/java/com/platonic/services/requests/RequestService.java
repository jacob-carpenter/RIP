package com.platonic.services.requests;

import com.platonic.models.requests.Request;

import java.util.List;

public interface RequestService {
    Request save(Request request);

    List<Request> getRequestsByUserId(Long userId);
    List<Request> getRequestsByGroupId(Long groupId);

    Request getRequest(Long requestId);
}
