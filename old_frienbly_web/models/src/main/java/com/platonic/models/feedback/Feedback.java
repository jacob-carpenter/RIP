package com.platonic.models.feedback;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "feedback")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "feedback_id", nullable = false, updatable = false)
    private Long feedbackId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "feedback")
    private String feedback;

    @Column(name = "feedback_type")
    private FeedbackType feedbackType;

    @Column(name = "sent_time")
    private Timestamp sentTime;

    public Long getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(Long feedbackId) {
        this.feedbackId = feedbackId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public FeedbackType getFeedbackType() {
        return feedbackType;
    }

    public void setFeedbackType(FeedbackType feedbackType) {
        this.feedbackType = feedbackType;
    }

    public Timestamp getSentTime() {
        return sentTime;
    }

    public void setSentTime(Timestamp sentTime) {
        this.sentTime = sentTime;
    }
}
