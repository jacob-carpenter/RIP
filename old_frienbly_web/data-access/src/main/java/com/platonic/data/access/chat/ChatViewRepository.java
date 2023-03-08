package com.platonic.data.access.chat;

import com.platonic.models.chat.ChatView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatViewRepository extends JpaRepository<ChatView, Long> {

    ChatView findOneByUserIdAndChatId(Long userId, Long chatId);

    List<ChatView> findAllByUserId(Long userId);
}
