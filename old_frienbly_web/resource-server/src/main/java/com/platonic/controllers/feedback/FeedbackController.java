package com.platonic.controllers.feedback;

import com.platonic.models.feedback.Feedback;
import com.platonic.models.user.UserContext;
import com.platonic.services.feedback.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("api/feedback")
public class FeedbackController {

    @Autowired
    private UserContext userContext;

    @Autowired
    private FeedbackService feedbackService;


    @RequestMapping(method = RequestMethod.POST)
    public Feedback saveEvent(@RequestBody Feedback feedback) {
        feedback.setUserId(userContext.getCurrentUser().getId());

        return feedbackService.save(feedback);
    }
}
