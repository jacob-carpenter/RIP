import {GroupTag} from './group-tag';

export class GroupDetails {
  constructor() {
    this.groupTags = new Array<GroupTag>();
  }

  id: number;
  startDate: Date;
  endDate: Date;

  name: string;
  description: string;

  useAge: boolean;
  suggestedAge: number;

  imageId: string;
  imageRotation: number;
  lookingForIndividuals: boolean;
  lookingForGroups: boolean;
  privateInd: boolean;
  onlineOnly: boolean;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  province: string;
  postalCode: number;
  country: string;
  groupTags: GroupTag[];

  joined: boolean;
}
