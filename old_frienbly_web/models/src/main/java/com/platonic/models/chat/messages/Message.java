package com.platonic.models.chat.messages;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "messages")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "message_id", nullable = false, updatable = false)
    private Long messageId;

    @Column(name = "chat_id", nullable = false, updatable = false)
    private Long chatId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(name = "message")
    private String message;

    @Column(name = "system", updatable = false)
    private Boolean system;

    @Column(name = "sent_date_time", updatable = false)
    private Timestamp sentDateTime;

    @Column(name = "image_height")
    private int imageHeight;

    @Column(name = "giphy_url")
    private String giphyUrl;

    @Column(name = "image_id")
    private String imageId;

    @Column(name = "image_rotation")
    private int imageRotation;

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "request_id")
    private Long requestId;

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Timestamp getSentDateTime() {
        return sentDateTime;
    }

    public void setSentDateTime(Timestamp sentDateTime) {
        this.sentDateTime = sentDateTime;
    }

    public Boolean getSystem() {
        return system;
    }

    public void setSystem(Boolean system) {
        this.system = system;
    }

    public int getImageHeight() {
        return imageHeight;
    }

    public void setImageHeight(int imageHeight) {
        this.imageHeight = imageHeight;
    }

    public String getGiphyUrl() {
        return giphyUrl;
    }

    public void setGiphyUrl(String giphyUrl) {
        this.giphyUrl = giphyUrl;
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

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public boolean equals(Object comp) {
        if (comp == null || !(comp instanceof Message)) {
            return false;
        }

        return this.getMessageId() == ((Message) comp).getMessageId();
    }

    public int hashCode() {
        return this.getMessageId() != null ? this.getMessageId().hashCode() : 0;
    }
}
