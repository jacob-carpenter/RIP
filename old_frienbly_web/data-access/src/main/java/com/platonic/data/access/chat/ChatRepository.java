package com.platonic.data.access.chat;

import com.platonic.models.chat.Chat;
import com.platonic.models.group.GroupMemberType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findAllByChatIdInAndActive(List<Long> chatId, Boolean active);
}
