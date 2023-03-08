package com.platonic.models.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "user_details")
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDetails implements Serializable {
    @Id
    @Column(name = "user_id", nullable = false, updatable = false, unique = true)
    private Long id;

    @OneToOne(targetEntity = User.class, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "birthdate")
    private Date birthdate;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "sex")
    private SexType sex;

    @Column(name = "image_id")
    private String imageId;

    @Column(name = "image_rotation")
    private int imageRotation;

    @Column(name = "looking_for_individuals")
    private boolean lookingForIndividuals;

    @Column(name = "looking_for_groups")
    private boolean lookingForGroups;

    @Column(name = "online_only")
    private boolean onlineOnly;

    @Column(name = "latitude")
    private double latitude;

    @Column(name = "longitude")
    private double longitude;

    @Column(name = "street")
    private String street;

    @Column(name = "city")
    private String city;

    @Column(name = "province")
    private String province;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    @Column(name = "about")
    private String about;

    @Column(name = "last_activity")
    private Timestamp lastActivity;

    @OneToMany(targetEntity = UserTag.class, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "user_id", insertable = false, updatable = false)
    private List<UserTag> userTags;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    public boolean isEnabled() {
        return user != null && user.isEnabled();
    }

    public Date getBirthdate() {
        return birthdate;
    }

    public void setBirthdate(Date birthdate) {
        this.birthdate = birthdate;
    }


    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public SexType getSex() {
        return sex;
    }

    public void setSex(SexType sex) {
        this.sex = sex;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public int getImageRotation() {
        return imageRotation;
    }

    public void setImageRotation(int imageRotation) {
        this.imageRotation = imageRotation;
    }

    public boolean isLookingForIndividuals() {
        return lookingForIndividuals;
    }

    public void setLookingForIndividuals(boolean lookingForIndividuals) {
        this.lookingForIndividuals = lookingForIndividuals;
    }

    public boolean isLookingForGroups() {
        return lookingForGroups;
    }

    public void setLookingForGroups(boolean lookingForGroups) {
        this.lookingForGroups = lookingForGroups;
    }

    public boolean isOnlineOnly() {
        return onlineOnly;
    }

    public void setOnlineOnly(boolean onlineOnly) {
        this.onlineOnly = onlineOnly;
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

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public Timestamp getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Timestamp lastActivity) {
        this.lastActivity = lastActivity;
    }

    public List<UserTag> getUserTags() {
        return userTags;
    }

    public void setUserTags(List<UserTag> userTags) {
        this.userTags = userTags;
    }
}
