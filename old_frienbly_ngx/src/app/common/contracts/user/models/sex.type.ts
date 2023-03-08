export enum SexType {
  UNKNOWN, FEMALE, MALE, OTHER
}

export class SexTypeMap {
  public static sexTypes = [
    {name: 'Unknown', value: SexType.UNKNOWN},
    {name: 'Female', value: SexType.FEMALE},
    {name: 'Male', value: SexType.MALE},
    {name: 'Other', value: SexType.OTHER}
  ];
}
