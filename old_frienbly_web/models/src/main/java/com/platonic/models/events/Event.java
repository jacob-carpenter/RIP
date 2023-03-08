package com.platonic.models.events;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "events")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "event_id", nullable = false, updatable = false)
    private Long eventId;

    @Column(name = "sent_by_user_id")
    private Long sentByUserId;

    @Column(name = "targetted_chat_id")
    private Long targettedChatId;

    @Column(name = "is_cancelled")
    private Boolean isCancelled;

    @Column(name = "cancellation_time")
    private Timestamp cancellationTime;

    @Column(name = "image_id")
    private String imageId;

    @Column(name = "image_rotation")
    private Integer imageRotation;

    @Column(name = "sent_date_time")
    private Timestamp sentDateTime;

    @Column(name = "event_date_time")
    private Timestamp eventDateTime;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "event_description")
    private String eventDescription;

    @Column(name = "online_only")
    private Boolean onlineOnly;

    @Column(name = "location_name")
    private String locationName;

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

    @OneToMany(targetEntity = EventRsvp.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "event_id", insertable = false, updatable = false)
    private List<EventRsvp> eventRsvps;

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getSentByUserId() {
        return sentByUserId;
    }

    public void setSentByUserId(Long sentByUserId) {
        this.sentByUserId = sentByUserId;
    }

    public Long getTargettedChatId() {
        return targettedChatId;
    }

    public void setTargettedChatId(Long targettedChatId) {
        this.targettedChatId = targettedChatId;
    }

    public Boolean getCancelled() {
        return isCancelled;
    }

    public void setCancelled(Boolean cancelled) {
        isCancelled = cancelled;
    }

    public Timestamp getCancellationTime() {
        return cancellationTime;
    }

    public void setCancellationTime(Timestamp cancellationTime) {
        this.cancellationTime = cancellationTime;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public Integer getImageRotation() {
        return imageRotation;
    }

    public void setImageRotation(Integer imageRotation) {
        this.imageRotation = imageRotation;
    }

    public Timestamp getSentDateTime() {
        return sentDateTime;
    }

    public void setSentDateTime(Timestamp sentDateTime) {
        this.sentDateTime = sentDateTime;
    }

    public Timestamp getEventDateTime() {
        return eventDateTime;
    }

    public void setEventDateTime(Timestamp eventDateTime) {
        this.eventDateTime = eventDateTime;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventDescription() {
        return eventDescription;
    }

    public void setEventDescription(String eventDescription) {
        this.eventDescription = eventDescription;
    }

    public Boolean getOnlineOnly() {
        return onlineOnly;
    }

    public void setOnlineOnly(Boolean onlineOnly) {
        this.onlineOnly = onlineOnly;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
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

    public List<EventRsvp> getEventRsvps() {
        return eventRsvps;
    }

    public void setEventRsvps(List<EventRsvp> eventRsvps) {
        this.eventRsvps = eventRsvps;
    }
}
