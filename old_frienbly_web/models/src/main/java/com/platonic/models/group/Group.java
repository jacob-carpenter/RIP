package com.platonic.models.group;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;

@Entity
@Table(name = "groups")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "group_id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Transient
    private GroupDetails groupDetails;

    public Group() {
        super();
        this.enabled=false;
    }

    public Group(String name, boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GroupDetails getGroupDetails() {
        return groupDetails;
    }

    public void setGroupDetails(GroupDetails groupDetails) {
        this.groupDetails = groupDetails;
    }
}
