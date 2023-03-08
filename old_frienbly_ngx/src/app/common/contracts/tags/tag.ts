import {TagType} from './tag.type';

export class Tag {
  tagId: number;
  display: string;
}

export class TagContainer {
  tag: Tag;
  tagType: TagType;
}

export class ViewableTag {
  public readonly: boolean = false;

  constructor(
    public value: any,
    public display: string
  ) {}
}
