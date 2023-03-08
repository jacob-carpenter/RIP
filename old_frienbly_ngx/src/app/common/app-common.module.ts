import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule  } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material';
import { MatCardModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatSelectModule } from '@angular/material';
import { MatOptionModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material';
import { MatNativeDateModule } from '@angular/material';
import { MatIconModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { MatSidenavModule, MatListModule } from '@angular/material';
import { MatExpansionModule} from '@angular/material';
import { MatSlideToggleModule} from '@angular/material';
import { MatChipsModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'angular2-markdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightJsModule, HighlightJsService } from 'angular2-highlight-js';
import { Ng2Webstorage } from 'ngx-webstorage';
import { TagInputModule } from 'ngx-chips';
import { PasswordStrengthBarModule } from 'ng2-password-strength-bar';
import { OrderModule } from 'ngx-order-pipe';
import { ClickOutsideModule } from 'ng-click-outside';
import { CalendarModule } from 'primeng/primeng';

import { AuthenticationInterceptor } from './services/authentication.interceptor';

import { PrettyJsonPipe } from './pretty-json/pretty.json.pipe';

import { environment } from '../../environments/environment';

import { ImageUploadModule } from './components/image-uploader/image-upload.module';

import { TechnicalInfoComponent } from './technical-info/technical-info.component';
import { FooterComponent} from './menus/footer/footer.component';
import { TopMenuComponent } from './menus/top-menu/top-menu.component';
import { LeftMenuComponent } from './menus/left-menu/left-menu.component';
import { UserMenuComponent } from './menus/user-menu/user-menu.component';
import { GroupMenuComponent } from './menus/group-menu/group-menu.component';
import { SearchMenuComponent } from './menus/search-menu/search-menu.component';
import { MessengerMenuComponent } from './menus/messenger-menu/messenger-menu.component';
import { EventMenuComponent } from './menus/event-menu/event-menu.component';
import { TokenCountComponent } from './token-count/token-count.component';

import { ConfirmationDialogComponent } from './components/dialogs/confirmation/confirmation-dialog.component';
import { ImageDisplayComponent } from './components/image-display/image-display.component';
import { InlineUserDisplayComponent } from './components/inline-user-display/inline-user-display.component';
import { InlineGroupDisplayComponent } from './components/inline-group-display/inline-group-display.component';

import { RoutingService } from './services/routing.service';
import { UserService } from './services/user.service';
import { ScreenSizeService } from './services/screen-size.service';
import { AuthenticationService } from './services/authentication.service';
import { GeolocationService } from './services/geolocation.service';
import { VerificationService } from './services/verification/verification.service';
import { TagService } from './services/tags/tag.service';
import { GroupService } from './services/groups/group.service';
import { MessengerService } from './services/messenger.service';
import { EventService } from './services/event.service';
import { BlockService } from './services/block.service';
import { UnreadMessageService } from './services/unread-message.service';
import { EventSettingsService } from './services/events/event-settings.service';

import { NavigationGuardService } from './components/guards/services/navigation.guard.service';
import { NavigationGuard } from './components/guards/navigation.guard';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightJsModule,
    MarkdownModule.forRoot(),
    HttpClientModule,
    HttpClientXsrfModule,
    BrowserAnimationsModule,
    TagInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    FlexLayoutModule,
    Ng2Webstorage,
    ImageUploadModule.forRoot(),
    PasswordStrengthBarModule,
    OrderModule,
    ClickOutsideModule,
    CalendarModule
  ],
  declarations: [
    PrettyJsonPipe,
    FooterComponent,
    TechnicalInfoComponent,
    TopMenuComponent,
    LeftMenuComponent,
    UserMenuComponent,
    GroupMenuComponent,
    MessengerMenuComponent,
    TokenCountComponent,
    ImageDisplayComponent,
    ConfirmationDialogComponent,
    SearchMenuComponent,
    InlineUserDisplayComponent,
    InlineGroupDisplayComponent,
    EventMenuComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true },
    HighlightJsService,
    ScreenSizeService,
    AuthenticationService,
    UserService,
    RoutingService,
    GeolocationService,
    MatSelectModule,
    VerificationService,
    TagService,
    GroupService,
    MessengerService,
    EventService,
    BlockService,
    NavigationGuardService,
    NavigationGuard,
    UnreadMessageService,
    EventSettingsService
  ],
  exports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HighlightJsModule,
    MarkdownModule,
    HttpClientModule,
    BrowserAnimationsModule,
    TagInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatSelectModule,
    MatOptionModule,
    PrettyJsonPipe,
    FooterComponent,
    TechnicalInfoComponent,
    Ng2Webstorage,
    FlexLayoutModule,
    TopMenuComponent,
    LeftMenuComponent,
    UserMenuComponent,
    GroupMenuComponent,
    MessengerMenuComponent,
    TokenCountComponent,
    ImageUploadModule,
    ImageDisplayComponent,
    ConfirmationDialogComponent,
    PasswordStrengthBarModule,
    SearchMenuComponent,
    OrderModule,
    InlineUserDisplayComponent,
    InlineGroupDisplayComponent,
    ClickOutsideModule,
    EventMenuComponent,
    CalendarModule
  ]
})
export class AppCommonModule { }
