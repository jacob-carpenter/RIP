package com.platonic.models.group;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.Period;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "group_details")
@JsonIgnoreProperties(ignoreUnknown = true)
public class GroupDetails implements Serializable {
    @Id
    @Column(name = "group_id", nullable = false, updatable = false, unique = true)
    private Long id;

    @Column(name = "startdate")
    private Date startDate;

    @Column(name = "enddate")
    private Date endDate;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "use_age")
    private boolean useAge;

    @Column(name = "suggested_birthdate")
    private Date suggestedBirthdate;

    @Column(name = "image_id")
    private String imageId;

    @Column(name = "image_rotation")
    private int imageRotation;

    @Column(name = "looking_for_individuals")
    private boolean lookingForIndividuals;

    @Column(name = "looking_for_groups")
    private boolean lookingForGroups;

    @Column(name = "is_private")
    private Boolean privateInd;

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

    @OneToMany(targetEntity = GroupTag.class, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "group_id", insertable = false, updatable = false)
    private List<GroupTag> groupTags;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isUseAge() {
        return useAge;
    }

    public void setUseAge(boolean useAge) {
        this.useAge = useAge;
    }

    public Date getSuggestedBirthdate() {
        return suggestedBirthdate;
    }

    public void setSuggestedBirthdate(Date suggestedBirthdate) {
        this.suggestedBirthdate = suggestedBirthdate;
    }

    public int getSuggestedAge() {
        if (this.suggestedBirthdate != null) {
            Calendar now = Calendar.getInstance();
            Calendar dateOfBirth = Calendar.getInstance();
            dateOfBirth.setTime(suggestedBirthdate);
            return now.get(Calendar.YEAR) - dateOfBirth.get(Calendar.YEAR);
        }
        return 18;
    }

    public void setSuggestedAge(int suggestedAge) {
        Calendar now = Calendar.getInstance();
        now.add(Calendar.YEAR, - suggestedAge);

        this.suggestedBirthdate = now.getTime();
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

    public Boolean isPrivateInd() {
        return privateInd;
    }

    public void setPrivateInd(Boolean privateInd) {
        this.privateInd = privateInd;
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

    public List<GroupTag> getGroupTags() {
        return groupTags;
    }

    public void setGroupTags(List<GroupTag> groupTags) {
        this.groupTags = groupTags;
    }
}
