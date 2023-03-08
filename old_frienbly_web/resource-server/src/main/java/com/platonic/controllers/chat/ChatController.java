package com.platonic.controllers.chat;

import com.platonic.contracts.chat.messages.MessageRetrievalReply;
import com.platonic.contracts.chat.messages.MessageRetrievalRequest;
import com.platonic.models.chat.Chat;
import com.platonic.models.user.UserContext;
import com.platonic.models.user.UserDetails;
import com.platonic.services.messenger.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("api/chat")
public class ChatController {

    @Autowired
    private UserContext userContext;

    @Autowired
    private ChatService chatService;

    @RequestMapping(method = RequestMethod.GET)
    public Chat[] get() {
        List<Chat> chats = chatService.get(userContext.getCurrentUser().getId());

        return chats.toArray(new Chat[chats.size()]);
    }

    @RequestMapping(path="{chatId}", method = RequestMethod.GET)
    public Chat get(@PathVariable Long chatId) {
        return chatService.getById(chatId);
    }

    @RequestMapping(path="getByDetails", method = RequestMethod.POST)
    public Chat getByDetails(@RequestBody Chat chat) {
        Chat foundChat = chatService.getByDetails(userContext.getCurrentUser().getId(), chat);

        return foundChat != null ? foundChat : chat;
    }

    @RequestMapping(path="save", method = RequestMethod.POST)
    public Chat save(@RequestBody Chat chat) {
        return chatService.save(chat);
    }

    @RequestMapping(method = RequestMethod.POST)
    public Chat getOrCreate(@RequestBody Chat chat) {
        return chatService.getOrCreate(userContext.getCurrentUser().getId(), chat);
    }

    @RequestMapping(path = "members/{chatId}", method = RequestMethod.GET)
    public List<UserDetails> getMembers(@PathVariable Long chatId) {
        return chatService.getMembers(chatId);
    }

    @RequestMapping(path = "getMessages", method = RequestMethod.POST)
    public MessageRetrievalReply getMessages(@RequestBody MessageRetrievalRequest messageRetrievalRequest) {
        return chatService.getMessages(messageRetrievalRequest);
    }

    @RequestMapping(path = "getUnreadChatIds", method = RequestMethod.GET)
    public List<Long> getChatIdsWithUnreadMessages() {
        return chatService.getChatIdsWithUnreadMessages(userContext.getCurrentUser().getId());
    }
}
