import {TagContainer, ViewableTag} from '../../tags/tag';
import {SexType} from '../../user/models/sex.type';

export class FilterCriteria {
  currentPage: number = 0;
  pageSize: number = 200;

  executedByUserId: number;
  executedByGroupId: number;

  searchForUsers: boolean;
  searchForGroups: boolean;

  useAgeRange: boolean;
  startAge: number;
  endAge: number;

  filteredByGender: boolean;
  sex: SexType;

  nameSearch: string;
  tags: ViewableTag[];
  modelTags: TagContainer[];

  includeInactives: boolean = true;

  canUseMyLocation: boolean;
  useMyLocation: boolean;

  searchRadiusInMiles: number;
  onlineOnly: boolean;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  province: string;
  postalCode: number;
  country: string;
}
