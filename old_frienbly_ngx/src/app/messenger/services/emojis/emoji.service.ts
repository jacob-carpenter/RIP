import { Injectable } from '@angular/core';
import { EMOJI_DB } from './emoji.db';

@Injectable()
export class EmojiService {

  PARSE_REGEX = /:([a-zA-Z0-9_\-\+]+):/g;

  private aliasToEmojiMap: any = {};

  constructor() {
    for (let data of EMOJI_DB) {
      for (let e of data.aliases) {
        this.aliasToEmojiMap[e] = data;
      }
    }
  }

  get(emoji) {
    if (this.aliasToEmojiMap.hasOwnProperty(emoji)) {
      return this.aliasToEmojiMap[emoji].emoji;
    }

    return emoji;
  }

  getAll() {
    return EMOJI_DB;
  }

  emojify(str) {
    if (!str) return;

    return str.split(this.PARSE_REGEX).map((emoji, index) => {
      // Return every second element as an emoji
      if (index % 2 === 0) { return emoji; }
      return this.get(emoji);
    }).join('');
  }

  translateMessageEmoticonsToSymbols(message: string) : string {
    for (let data of EMOJI_DB) {
      if (data.inputAliases && data.aliases && data.aliases.length > 0) {
        for (let inputAlias of data.inputAliases) {
          message = message.replace(inputAlias, this.getTextAlias(data.aliases[0]));
        }
      }

      if (data.aliases && data.aliases.length > 0) {
        message = message.replace(data.emoji, this.getTextAlias(data.aliases[0]));
      }
    }

    return message;
  }

  private getTextAlias(alias: string) {
    return ':' + alias + ':';
  }

}
