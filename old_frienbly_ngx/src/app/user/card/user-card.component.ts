import {Component, Injectable, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

import { UserDetails } from '../../common/contracts/user/models/user-details';

import { ViewableTag } from '../../common/contracts/tags/tag';

import { UserCardDetailsDialogComponent } from './details/user-card.details.dialog';

@Component({
  selector: 'user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
@Injectable()
export class UserCardComponent implements OnInit {
  @Input()
  public user: UserDetails;

  @Input()
  public searchedTags: ViewableTag[];

  public age: number;
  public cardTags: ViewableTag[] = new Array<ViewableTag>();

  constructor(
    private dialog: MatDialog
  ) {}

  public ngOnInit() {
    this.age = this.getAge(new Date(this.user.birthdate));

    this.cardTags = new Array<ViewableTag>();
    var searchedTagDisplays = new Array<string>();
    for (var index = 0; index < this.searchedTags.length; index++) {
      searchedTagDisplays.push(this.searchedTags[index].display);
    }

    this.populateOrderedCardTags(searchedTagDisplays);
  }

  public populateOrderedCardTags(searchedTagDisplays: string[]) {
    var tagDisplays = new Array<string>();
    for (var index = 0; index < this.user.userTags.length; index++) {
      var userTag = this.user.userTags[index];

      if (userTag && tagDisplays.indexOf(userTag.tag.display) < 0 && searchedTagDisplays.indexOf(userTag.tag.display) >= 0) {
        tagDisplays.push(userTag.tag.display);

        var viewableTag = new ViewableTag(userTag.tag.display, userTag.tag.display);
        viewableTag.readonly = true;
        this.cardTags.push(viewableTag);
      }
    }

    for (var index = 0; index < this.user.userTags.length; index++) {
      var userTag = this.user.userTags[index];

      if (userTag && tagDisplays.indexOf(userTag.tag.display) < 0) {
        tagDisplays.push(userTag.tag.display);

        var viewableTag = new ViewableTag(userTag.tag.display, userTag.tag.display);
        viewableTag.readonly = true;
        this.cardTags.push(viewableTag);
      }
    }
  }

  public getCardTags() : ViewableTag[] {
    return this.cardTags;
  }

  public openDetailView() {
    this.dialog.open(UserCardDetailsDialogComponent, {
      panelClass: 'details-card-dialog',
      data: {
        user: this.user
      }
    });
  }

  private getAge(birthday: Date) {
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
}
