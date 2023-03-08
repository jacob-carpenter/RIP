package com.platonic.contracts.user;

import com.platonic.models.user.SexType;
import com.platonic.models.user.UserDetails;
import com.platonic.models.user.UserTag;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

public class UserDetailsLite {
    private Long id;

    private Date birthdate;

    private String username;

    private String firstName;

    private String lastName;

    private SexType sex;

    private String imageId;

    private int imageRotation;

    private boolean lookingForIndividuals;

    private boolean lookingForGroups;

    private boolean onlineOnly;

    private String city;

    private String province;

    private String country;

    private String about;

    private List<UserTag> userTags;

    private Timestamp lastActivity;

    public UserDetailsLite(UserDetails userDetails) {
        this.id = userDetails.getId();
        this.username = userDetails.getUsername();
        this.birthdate = userDetails.getBirthdate();
        this.firstName = userDetails.getFirstName();
        this.lastName = userDetails.getLastName();
        this.sex = userDetails.getSex();
        this.imageId = userDetails.getImageId();
        this.imageRotation = userDetails.getImageRotation();
        this.lookingForIndividuals = userDetails.isLookingForIndividuals();
        this.lookingForGroups = userDetails.isLookingForGroups();
        this.onlineOnly = userDetails.isOnlineOnly();
        this.city = userDetails.getCity();
        this.province = userDetails.getProvince();
        this.country = userDetails.getCountry();
        this.about = userDetails.getAbout();
        this.userTags = userDetails.getUserTags();
        this.lastActivity = userDetails.getLastActivity();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public Date getBirthdate() {
        return birthdate;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public SexType getSex() {
        return sex;
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

    public String getAbout() {
        return about;
    }

    public List<UserTag> getUserTags() {
        return userTags;
    }

    public Timestamp getLastActivity() {
        return lastActivity;
    }
}
