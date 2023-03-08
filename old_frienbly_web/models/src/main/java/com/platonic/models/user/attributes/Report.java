package com.platonic.models.user.attributes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "reports")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "report_id", nullable = false, updatable = false)
    private Long reportId;

    @Column(name = "reported_user_id", nullable = false, updatable = false)
    private Long reportedUserId;

    @Column(name = "reported_by_user_id", nullable = false, updatable = false)
    private Long reportedByUserId;

    @Column(name = "reported_time", nullable = false, updatable = false)
    private Timestamp reportedTime;

    @Column(name = "reason", updatable = false)
    private String reason;

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Long getReportedUserId() {
        return reportedUserId;
    }

    public void setReportedUserId(Long reportedUserId) {
        this.reportedUserId = reportedUserId;
    }

    public Long getReportedByUserId() {
        return reportedByUserId;
    }

    public void setReportedByUserId(Long reportedByUserId) {
        this.reportedByUserId = reportedByUserId;
    }

    public Timestamp getReportedTime() {
        return reportedTime;
    }

    public void setReportedTime(Timestamp reportedTime) {
        this.reportedTime = reportedTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
