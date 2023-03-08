package com.platonic.contracts.search;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.platonic.contracts.group.GroupDetailsLite;
import com.platonic.contracts.user.UserDetailsLite;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchResult {
    private EntityType entityType;
    private long entityId;
    private int order;

    private GroupDetailsLite group;
    private UserDetailsLite user;

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public long getEntityId() {
        return entityId;
    }

    public void setEntityId(long entityId) {
        this.entityId = entityId;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public GroupDetailsLite getGroup() {
        return group;
    }

    public void setGroup(GroupDetailsLite group) {
        this.group = group;
    }

    public UserDetailsLite getUser() {
        return user;
    }

    public void setUser(UserDetailsLite user) {
        this.user = user;
    }

    @JsonFormat(shape = JsonFormat.Shape.NUMBER_INT)
    public enum EntityType {
        USER, GROUP
    }
}
