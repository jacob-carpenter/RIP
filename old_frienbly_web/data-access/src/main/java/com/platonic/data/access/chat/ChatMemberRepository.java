package com.platonic.data.access.chat;

import com.platonic.models.chat.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
    List<ChatMember> findByChatId(Long chatId);

    List<ChatMember> findByUserId(Long userId);

    List<ChatMember> findByUserIdIn(Collection<Long> userIds);

    List<ChatMember> findByGroupIdIn(Collection<Long> groupIds);

    List<ChatMember> findByGroupIdInAndChatIdIn(Collection<Long> groupIds, Collection<Long> chatIds);
}
