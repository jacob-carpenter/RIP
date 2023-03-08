import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MessengerModule } from '../messenger/messenger.module';
import { SplashModule } from '../splash/splash.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { UserModule } from '../user/user.module';
import { EventModule } from '../events/event.module';

import { RouteProvider } from './route.provider';

@NgModule({
  imports: [
    RouterModule.forRoot(RouteProvider.getRoutes()),
    DashboardModule,
    UserModule,
    SplashModule,
    MessengerModule,
    EventModule
  ],
  providers: [],
  exports: [
    RouterModule,
    DashboardModule,
    UserModule,
    SplashModule,
    MessengerModule,
    EventModule
  ]
})
export class RoutingModule { }
