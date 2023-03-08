package com.platonic.services.requests.impl;

import com.platonic.data.access.requests.RequestRepository;
import com.platonic.models.requests.Request;
import com.platonic.services.requests.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestServiceImpl implements RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Override
    public Request save(Request request) {
        return requestRepository.save(request);
    }

    @Override
    public List<Request> getRequestsByUserId(Long userId) {
        return requestRepository.findAllByUserIdOrTargetUserIdAndActiveAndAccepted(userId, true, false);
    }

    @Override
    public List<Request> getRequestsByGroupId(Long groupId) {
        return requestRepository.findAllByGroupIdOrTargetGroupIdAndActiveAndAccepted(groupId, true, false);
    }

    @Override
    public Request getRequest(Long requestId) {
        return requestRepository.findOne(requestId);
    }
}
