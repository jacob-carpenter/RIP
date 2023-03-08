package com.platonic.data.access.chat.message;

import com.platonic.models.chat.messages.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.sql.Timestamp;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT DISTINCT m.userId FROM Message m WHERE m.chatId = ?1")
    List<Long> findUserIdsWithChatMessages(Long chatId);

    @Query(value = "SELECT m FROM Message m WHERE m.chatId = ?1 ORDER BY m.sentDateTime desc")
    List<Message> findEarliestMessageForChatId(Long chatId, Pageable pageable);

    @Query(value = "SELECT m FROM Message m WHERE m.chatId = ?1 AND m.sentDateTime < ?2 ORDER BY m.sentDateTime")
    List<Message> findByChatIdAndDateLessThanLimited(Long chatId, Timestamp endDate, Pageable pageable);

    @Query(value = "SELECT m FROM Message m WHERE m.chatId = ?1 ORDER BY m.sentDateTime")
    List<Message> findByChatIdLimited(Long chatId, Pageable pageable);
}
