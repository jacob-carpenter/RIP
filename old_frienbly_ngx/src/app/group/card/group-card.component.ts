import {Component, Injectable, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';

import {GroupDetails} from '../../common/contracts/group/models/group-details';

import {GroupCardDetailsDialogComponent} from './details/group-card.details.dialog';

import {ViewableTag} from '../../common/contracts/tags/tag';

@Component({
  selector: 'group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
@Injectable()
export class GroupCardComponent implements OnInit {
  @Input()
  public group: GroupDetails;

  @Input()
  public searchedTags: ViewableTag[];

  public cardTags: ViewableTag[] = new Array<ViewableTag>();

  constructor(
    private dialog: MatDialog
  ) {}

  public ngOnInit() {
    this.cardTags = new Array<ViewableTag>();
    var searchedTagDisplays = new Array<string>();
    for (var index = 0; index < this.searchedTags.length; index++) {
      searchedTagDisplays.push(this.searchedTags[index].display);
    }

    this.populateOrderedCardTags(searchedTagDisplays);
  }

  public populateOrderedCardTags(searchedTagDisplays: string[]) {
    var tagDisplays = new Array<string>();
    for (var index = 0; index < this.group.groupTags.length; index++) {
      var groupTag = this.group.groupTags[index];

      if (groupTag && tagDisplays.indexOf(groupTag.tag.display) < 0 && searchedTagDisplays.indexOf(groupTag.tag.display) >= 0) {
        tagDisplays.push(groupTag.tag.display);

        var viewableTag = new ViewableTag(groupTag.tag.display, groupTag.tag.display);
        viewableTag.readonly = true;
        this.cardTags.push(viewableTag);
      }
    }

    for (var index = 0; index < this.group.groupTags.length; index++) {
      var groupTag = this.group.groupTags[index];

      if (groupTag && tagDisplays.indexOf(groupTag.tag.display) < 0) {
        tagDisplays.push(groupTag.tag.display);

        var viewableTag = new ViewableTag(groupTag.tag.display, groupTag.tag.display);
        viewableTag.readonly = true;
        this.cardTags.push(viewableTag);
      }
    }
  }

  public openDetailView() {
    setTimeout(() => {
      let dialogRef = this.dialog.open(GroupCardDetailsDialogComponent, {
        panelClass: 'details-card-dialog',
        data: {
          group: this.group
        }
      });
    }, 0);
  }
}
