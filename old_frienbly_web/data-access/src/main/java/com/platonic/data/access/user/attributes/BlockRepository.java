package com.platonic.data.access.user.attributes;

import com.platonic.models.user.attributes.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findAllByUserId(Long userId);

    Block findByUserIdAndTargetUserId(Long userId, Long targetUserId);
}
