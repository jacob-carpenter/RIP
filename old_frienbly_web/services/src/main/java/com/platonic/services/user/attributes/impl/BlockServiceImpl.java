package com.platonic.services.user.attributes.impl;

import com.platonic.data.access.user.attributes.BlockRepository;
import com.platonic.models.user.attributes.Block;
import com.platonic.services.user.attributes.BlockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class BlockServiceImpl implements BlockService {
    @Autowired
    private BlockRepository blockRepository;

    @Override
    public boolean blockUser(long userId, long targetUserId) {
        if (blockRepository.findByUserIdAndTargetUserId(userId, targetUserId) == null) {
            Block block = new Block();
            block.setBlockTime(new Timestamp(new java.util.Date().getTime()));
            block.setTargetUserId(targetUserId);
            block.setUserId(userId);

            blockRepository.save(block);
        }

        return false;
    }

    @Override
    public boolean unblockUser(long userId, long targetUserId) {
        Block block = blockRepository.findByUserIdAndTargetUserId(userId, targetUserId);

        if (block != null) {
            blockRepository.delete(block);
            return true;
        }

        return false;
    }

    @Override
    public List<Block> getBlocks(long userId) {
        return blockRepository.findAllByUserId(userId);
    }
}
