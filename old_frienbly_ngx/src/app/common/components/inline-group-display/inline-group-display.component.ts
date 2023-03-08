import {Component, Inject, Input, Output, EventEmitter} from '@angular/core';

import {GroupDetails} from '../../../common/contracts/group/models/group-details';

@Component({
  selector: 'inline-group-display',
  templateUrl: './inline-group-display.component.html',
  styleUrls: ['./inline-group-display.component.scss']
})
export class InlineGroupDisplayComponent {

  @Input()
  public group: GroupDetails;
  
}
