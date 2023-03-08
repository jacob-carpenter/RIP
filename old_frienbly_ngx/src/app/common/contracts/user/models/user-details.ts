import {SexType} from './sex.type';
import {UserTag} from './user-tag';

export class UserDetails {
    id: number;
    username: string;
    birthdate: Date;
    firstName: string;
    lastName: string;
    sex: SexType;
    imageId: string;
    imageRotation: number;
    lookingForIndividuals: boolean;
    lookingForGroups: boolean;
    onlineOnly: boolean;
    latitude: number;
    longitude: number;
    street: string;
    city: string;
    province: string;
    postalCode: number;
    country: string;
    about: string;
    lastActivity: Date;
    userTags: UserTag[];
}
