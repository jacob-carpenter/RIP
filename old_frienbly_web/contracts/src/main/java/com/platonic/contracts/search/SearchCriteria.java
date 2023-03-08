package com.platonic.contracts.search;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.platonic.models.user.SexType;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchCriteria {
    private int currentPage;
    private int pageSize;

    private Long executedByUserId;
    private Long executedByGroupId;

    private boolean searchForUsers;
    private boolean searchForGroups;

    private boolean useAgeRange;
    private int startAge;
    private int endAge;

    private boolean filteredByGender;
    private SexType sex;

    private String nameSearch;
    private List<ViewableTag> tags;

    private boolean onlineOnly;
    private int searchRadiusInMiles;
    private double latitude;
    private double longitude;

    private boolean includeInactives;

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public Long getExecutedByUserId() {
        return executedByUserId;
    }

    public void setExecutedByUserId(Long executedByUserId) {
        this.executedByUserId = executedByUserId;
    }

    public Long getExecutedByGroupId() {
        return executedByGroupId;
    }

    public void setExecutedByGroupId(Long executedByGroupId) {
        this.executedByGroupId = executedByGroupId;
    }

    public boolean isSearchForUsers() {
        return searchForUsers;
    }

    public void setSearchForUsers(boolean searchForUsers) {
        this.searchForUsers = searchForUsers;
    }

    public boolean isSearchForGroups() {
        return searchForGroups;
    }

    public void setSearchForGroups(boolean searchForGroups) {
        this.searchForGroups = searchForGroups;
    }

    public boolean isUseAgeRange() {
        return useAgeRange;
    }

    public void setUseAgeRange(boolean useAgeRange) {
        this.useAgeRange = useAgeRange;
    }

    public int getStartAge() {
        return startAge;
    }

    public void setStartAge(int startAge) {
        this.startAge = startAge;
    }

    public int getEndAge() {
        return endAge;
    }

    public void setEndAge(int endAge) {
        this.endAge = endAge;
    }

    public boolean isFilteredByGender() {
        return filteredByGender;
    }

    public void setFilteredByGender(boolean filteredByGender) {
        this.filteredByGender = filteredByGender;
    }

    public SexType getSex() {
        return sex;
    }

    public void setSex(SexType sex) {
        this.sex = sex;
    }

    public String getNameSearch() {
        return nameSearch;
    }

    public void setNameSearch(String nameSearch) {
        this.nameSearch = nameSearch;
    }

    public List<ViewableTag> getTags() {
        return tags;
    }

    public void setTags(List<ViewableTag> tags) {
        this.tags = tags;
    }

    public boolean isOnlineOnly() {
        return onlineOnly;
    }

    public void setOnlineOnly(boolean onlineOnly) {
        this.onlineOnly = onlineOnly;
    }

    public int getSearchRadiusInMiles() {
        return searchRadiusInMiles;
    }

    public void setSearchRadiusInMiles(int searchRadiusInMiles) {
        this.searchRadiusInMiles = searchRadiusInMiles;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public boolean getIncludeInactives() {
        return includeInactives;
    }

    public void setIncludeInactives(boolean includeInactives) {
        this.includeInactives = includeInactives;
    }

    public static class ViewableTag {
        private String value;
        private String display;

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getDisplay() {
            return display;
        }

        public void setDisplay(String display) {
            this.display = display;
        }
    }
}
