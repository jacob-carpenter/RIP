package com.platonic.services.feedback.impl;

import com.platonic.data.access.feedback.FeedbackRepository;
import com.platonic.models.feedback.Feedback;
import com.platonic.services.feedback.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    public Feedback save(Feedback feedback) {
        if (feedback.getFeedbackId() == null) {
            feedback.setSentTime(new Timestamp(new java.util.Date().getTime()));
        }

        return feedbackRepository.save(feedback);
    }
}
