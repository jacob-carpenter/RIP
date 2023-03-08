import {GroupDetails} from '../group/models/group-details';
import {UserDetails} from '../user/models/user-details';

export enum EntityType {
  USER, GROUP
}

export class SearchResult {
  public entityType: EntityType;
  public entityId: number;
  public order: number;

  public group: GroupDetails;
  public user: UserDetails;
}
