import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {UserDetails} from '../../../common/contracts/user/models/user-details';
import {GroupDetails} from '../../../common/contracts/group/models/group-details';

@Component({
  selector: 'chat-dialog',
  templateUrl: './chat.dialog.html',
  styleUrls: ['./chat.dialog.scss']
})
export class ChatDialogComponent {

  public user: UserDetails;

  public group: GroupDetails;

  public disableGroupChat: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
   ) {
     this.user = data.user;
     this.group = data.group;
     this.disableGroupChat = data.disableGroupChat;
   }

}
