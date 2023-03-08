package com.platonic.models.user.attributes;

import org.codehaus.jackson.annotate.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "blocks")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Block {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "block_id", nullable = false, updatable = false)
    private Long blockId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @Column(name = "target_user_id", updatable = false)
    private Long targetUserId;

    @Column(name = "block_time", nullable = false, updatable = false)
    private Timestamp blockTime;

    public Long getBlockId() {
        return blockId;
    }

    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
    }

    public Timestamp getBlockTime() {
        return blockTime;
    }

    public void setBlockTime(Timestamp blockTime) {
        this.blockTime = blockTime;
    }
}
