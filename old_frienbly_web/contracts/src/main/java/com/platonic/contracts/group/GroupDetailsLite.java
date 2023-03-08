package com.platonic.contracts.group;

import com.platonic.models.group.GroupDetails;
import com.platonic.models.group.GroupTag;

import java.util.Date;
import java.util.List;

public class GroupDetailsLite {
    private Long id;

    private Date startDate;

    private Date endDate;

    private String name;

    private String description;

    private String imageId;

    private int imageRotation;

    private boolean lookingForIndividuals;

    private boolean lookingForGroups;

    private Boolean privateInd;

    private boolean onlineOnly;

    private String city;

    private String province;

    private String country;

    private List<GroupTag> groupTags;

    public GroupDetailsLite(GroupDetails groupDetails) {
        this.id = groupDetails.getId();
        this.startDate = groupDetails.getStartDate();
        this.endDate = groupDetails.getEndDate();
        this.name = groupDetails.getName();
        this.description = groupDetails.getDescription();
        this.imageId = groupDetails.getImageId();
        this.imageRotation = groupDetails.getImageRotation();
        this.lookingForIndividuals = groupDetails.isLookingForIndividuals();
        this.lookingForGroups = groupDetails.isLookingForGroups();
        this.privateInd = groupDetails.isPrivateInd();
        this.onlineOnly = groupDetails.isOnlineOnly();
        this.city = groupDetails.getCity();
        this.province = groupDetails.getProvince();
        this.country = groupDetails.getCountry();
        this.groupTags = groupDetails.getGroupTags();
    }

    public Long getId() {
        return id;
    }

    public Date getStartDate() {
        return startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getImageId() {
        return imageId;
    }

    public int getImageRotation() {
        return imageRotation;
    }

    public boolean isLookingForIndividuals() {
        return lookingForIndividuals;
    }

    public boolean isLookingForGroups() {
        return lookingForGroups;
    }

    public Boolean isPrivateInd() {
        return privateInd;
    }

    public boolean isOnlineOnly() {
        return onlineOnly;
    }

    public String getCity() {
        return city;
    }

    public String getProvince() {
        return province;
    }

    public String getCountry() {
        return country;
    }

    public List<GroupTag> getGroupTags() {
        return groupTags;
    }
}
