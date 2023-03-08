
import {Group} from '../../contracts/group/models/group';

export interface GroupChangeListener {
  handleGroupChange(group: Group);
}
