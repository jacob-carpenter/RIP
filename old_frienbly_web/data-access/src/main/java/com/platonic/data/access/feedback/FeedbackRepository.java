package com.platonic.data.access.feedback;

import com.platonic.models.feedback.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
