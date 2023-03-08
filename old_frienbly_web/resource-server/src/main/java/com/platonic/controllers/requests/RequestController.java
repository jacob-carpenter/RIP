package com.platonic.controllers.requests;

import com.platonic.models.requests.Request;
import com.platonic.models.user.UserContext;
import com.platonic.services.requests.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("api/requests")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @Autowired
    private UserContext userContext;

    @RequestMapping(method = RequestMethod.GET)
    public List<Request> get() {
        return requestService.getRequestsByUserId(userContext.getCurrentUser().getId());
    }

    @RequestMapping(method = RequestMethod.GET, path="{requestId}")
    public Request get(@PathVariable Long requestId) {
        return requestService.getRequest(requestId);
    }

    @RequestMapping(method = RequestMethod.POST)
    public Request save(@RequestBody Request request) {
        return requestService.save(request);
    }

    @RequestMapping(path = "byUser/{userId}", method = RequestMethod.GET)
    public List<Request> getByUserId(@PathVariable Long userId) {
        return requestService.getRequestsByUserId(userId);
    }

    @RequestMapping(path = "byGroup/{groupId}", method = RequestMethod.GET)
    public List<Request> getByGroupId(@PathVariable Long groupId) {
        return requestService.getRequestsByGroupId(groupId);
    }
}
