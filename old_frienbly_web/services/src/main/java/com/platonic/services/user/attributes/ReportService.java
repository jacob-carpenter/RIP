package com.platonic.services.user.attributes;

public interface ReportService {
    boolean reportUser(long reportedByUserId, long reportedUserId, String reason);
}
