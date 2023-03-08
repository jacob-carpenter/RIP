package com.platonic.services.user.attributes;

import com.platonic.models.user.attributes.Block;

import java.util.List;

public interface BlockService {
    boolean blockUser(long userId, long targetUserId);

    boolean unblockUser(long userId, long targetUserId);

    List<Block> getBlocks(long userId);
}
