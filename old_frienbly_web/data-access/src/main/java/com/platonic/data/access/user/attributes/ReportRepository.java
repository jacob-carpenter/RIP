package com.platonic.data.access.user.attributes;

import com.platonic.models.user.attributes.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByReportedByUserId(Long reportedByUserId);

    List<Report> findAllByReportedUserId(Long reportedUserId);
}
