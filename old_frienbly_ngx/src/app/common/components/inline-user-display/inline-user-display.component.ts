import {Component, Inject, Input, Output, EventEmitter} from '@angular/core';

import {UserDetails} from '../../../common/contracts/user/models/user-details';

@Component({
  selector: 'inline-user-display',
  templateUrl: './inline-user-display.component.html',
  styleUrls: ['./inline-user-display.component.scss']
})
export class InlineUserDisplayComponent {

  @Input()
  public user: UserDetails;

}
