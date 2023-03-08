package com.platonic.services.user.attributes.impl;

import com.platonic.data.access.user.attributes.ReportRepository;
import com.platonic.models.user.attributes.Report;
import com.platonic.services.user.UserService;
import com.platonic.services.user.attributes.BlockService;
import com.platonic.services.user.attributes.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {
    long DAY_IN_MS = 1000 * 60 * 60 * 24;

    @Autowired
    private BlockService blockService;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserService userService;

    @Value("${report.limit.count:3}")
    private int reportLimitCount;

    @Override
    public boolean reportUser(long reportedByUserId, long reportedUserId, String reason) {
        List<Report> reports = reportRepository.findAllByReportedByUserId(reportedByUserId);

        for (Report report : reports) {
            if (report.getReportedByUserId() == reportedByUserId) {
                return false;
            }
        }

        Report report = new Report();
        report.setReason(reason);
        report.setReportedByUserId(reportedByUserId);
        report.setReportedUserId(reportedUserId);
        report.setReportedTime(new Timestamp(new java.util.Date().getTime()));
        reportRepository.save(report);

        blockService.blockUser(reportedByUserId, reportedUserId);

        Timestamp twoWeekLookback = new Timestamp(new java.util.Date().getTime() - (14 * DAY_IN_MS));
        List<Report> reportedUserReports = reportRepository.findAllByReportedUserId(reportedUserId);

        int reportCount = 0;
        for (Report checkedReport : reportedUserReports) {
            if (twoWeekLookback.before(checkedReport.getReportedTime())) {
                reportCount++;
            }
        }

        if (reportCount > reportLimitCount) {
            userService.setLockStatus(true, reportedUserId);
        }

        return true;
    }
}
