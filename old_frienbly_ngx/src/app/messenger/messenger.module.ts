import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';
import { EventModule } from '../events/event.module';

import { ChatComponent } from './components/chat/chat.component';
import { ChatHeaderComponent } from './components/chat-header/chat-header.component';
import { MessageDisplayComponent } from './components/chat/message-display/message-display.component';
import { ChatMessageInputComponent } from './components/chat-message-input/chat-message-input.component';
import { ChatDialogComponent } from './dialogs/chat/chat.dialog';

import { MessengerComponent } from './components/messenger/messenger.component';
import { MessengerLeftMenuComponent } from './components/messenger/left-menu/messenger.left-menu.component';
import { ChatMenuDisplayComponent } from './components/messenger/left-menu/chat-menu-display/chat-menu-display.component';
import { MessageDisplayRequestComponent } from './components/chat/message-display/requests/message-display-request.component';

import { EmojiInputDialogComponent } from './components/emoji/emoji.dialog.component';

import { RequestService } from './services/request.service';
import { ChatService } from './services/chat.service';
import { ChatUserService } from './services/chat-user.service';
import { EmojiService } from './services/emojis/emoji.service';
import { GiphyService } from './services/giphy/giphy.service';

@NgModule({
  imports: [
    AppCommonModule,
    EventModule
  ],
  declarations: [
    ChatComponent,
    ChatDialogComponent,
    MessengerComponent,
    MessengerLeftMenuComponent,
    EmojiInputDialogComponent,
    ChatMessageInputComponent,
    ChatMenuDisplayComponent,
    MessageDisplayComponent,
    ChatHeaderComponent,
    MessageDisplayRequestComponent
  ],
  entryComponents: [
    ChatDialogComponent,
    EmojiInputDialogComponent
  ],
  providers: [
    ChatService,
    EmojiService,
    RequestService,
    GiphyService,
    ChatUserService
  ],
  exports: [
    ChatComponent,
    ChatDialogComponent,
    MessengerComponent,
    MessengerLeftMenuComponent,
    EmojiInputDialogComponent,
    ChatMessageInputComponent,
    ChatMenuDisplayComponent,
    MessageDisplayComponent,
    ChatHeaderComponent,
    EventModule,
    MessageDisplayRequestComponent
  ]
})
export class MessengerModule { }
