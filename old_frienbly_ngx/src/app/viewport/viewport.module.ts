import { NgModule } from '@angular/core';

import { AppCommonModule } from '../common/app-common.module';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';

import { FilterSettingsService } from './search/filter/services/filter-settings.service';
import { SearchService } from './search/services/search.service';

import { SearchHeaderComponent } from './search/search-header/search-header.component';
import { SearchPageComponent } from './search/search-page.component';
import { SearchFilterComponent } from './search/filter/search-filter.component';
import { ViewportComponent } from './viewport.component';

@NgModule({
  imports: [
    AppCommonModule,
    UserModule,
    GroupModule
  ],
  declarations: [
    ViewportComponent,
    SearchPageComponent,
    SearchFilterComponent,
    SearchHeaderComponent
  ],
  entryComponents: [
    SearchFilterComponent
  ],
  providers: [
    FilterSettingsService,
    SearchService
  ],
  exports: [
    ViewportComponent,
    SearchPageComponent,
    SearchFilterComponent,
    SearchHeaderComponent
  ]
})
export class ViewportModule { }
