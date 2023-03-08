import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

import { EmojiService } from '../../services/emojis/emoji.service';

@Component({
  selector: 'emoji-dialog-input',
  template: `
    <div class="emoji-search"
      [ngClass]="popupAnchor"
      [hidden]="!popupOpen"
      (click)="$event.stopPropagation()"
      (clickOutside)="clickOutside($event)">
      <div class="search-header">
        <input type="search" placeholder="Search..."
          [(ngModel)]="filterEmojis"
          (ngModelChange)="updateFilteredEmojis()"
          />
      </div>
      <div class="emojis-container">
        <span *ngFor="let emoji of filteredEmojis"
              (click)="onEmojiClick(emoji.emoji)"
               title="{{emoji.aliases[0]}}">
          {{emoji.emoji}}
        </span>
      </div>
    </div>
  `,
  styles: [`
      :host {
        display: block;
        position: relative;
      }
      :host .emoji-search {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 10px;
        height: auto;
        line-height: 1.5;
        position: absolute;
        right: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        z-index: 100;
        box-shadow: 0 5px 7px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
      }
      :host .emoji-search:hover {
        box-shadow: 0 18px 35px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
      }
      :host .emoji-search[hidden] {
        display: none;
      }
      :host .emoji-search.bottom {
        top: -202px;
      }
      :host .emoji-search input {
        border-radius: 4px;
        font-size: 10px;
        padding: 4px 8px;
        margin: 0;
        height: 30px;
      }
      :host .emoji-search .search-header {
        background-color: #eee;
        border-bottom: 1px solid #ccc;
        border-radius: 4px 4px 0 0;
        padding: 4px 8px;
      }
      :host .emoji-search .emojis-container {
        border-radius: 0 0 4px 4px;
        max-height: 160px;
        padding: 5px 12px;
        overflow: auto;
        overflow-x: hidden;
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
      :host .emoji-search span {
        cursor: pointer;
        padding: 4px 3px 2px 4px;
        font-size: 24px;
      }
      :host .emoji-search span:hover {
        background-color: #ccc;
      }

  `]
})
export class EmojiInputDialogComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() textArea: any;
  @Input() popupAnchor = 'top';
  @Input() onEnter: Function = () => {};
  @Input() model: any;
  @Input() autofocus: boolean = false;

  @Output() modelChange: any = new EventEmitter();
  @Output() setPopupAction: any = new EventEmitter();
  @Output() blur: any = new EventEmitter();
  @Output() focus: any = new EventEmitter();
  @Output() keyup: any = new EventEmitter();
  @Output() emojiClick: any = new EventEmitter();

  @ViewChild('textAreaEl') textAreaEl;
  @ViewChild('inputTag') inputTag;

  public firstClickOutside: boolean = true;
  public input: string = '';
  public filterEmojis: string = '';
  public filteredEmojis: any[];
  public allEmojis: Array<any>;
  public popupOpen: boolean = false;

  constructor(public emojiService: EmojiService) {

  }

  ngOnInit() {
    if (this.setPopupAction) {
        this.setPopupAction.emit((status) => {this.openPopup(status)});
    }
    this.allEmojis = this.emojiService.getAll();
    this.clean();
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      if (this.textArea) {
        this.textAreaEl.nativeElement.focus();
      } else {
        this.inputTag.nativeElement.focus();
      }
    }
  }

  ngOnChanges() {
    if (this.model !== this.input) {
      this.input = this.model;
    }
  }

  onKeyup(event) {
    if (this.keyup) {
      this.keyup.emit(event);
    }
  }
  onBlur(event) {
    if (this.blur) {
      this.blur.emit(event);
    }
  }
  onFocus(event) {
    if (this.focus) {
      this.focus.emit(event);
    }
  }

  clean() {
    this.filterEmojis = '';
    this.filteredEmojis = this.getFilteredEmojis();
  }

  openPopup(status: boolean = null) {
    if (status === null) {
        this.popupOpen = !this.popupOpen;
    } else {
        this.popupOpen = status;
    }
  }

  updateFilteredEmojis() {
     this.filteredEmojis = this.getFilteredEmojis();
  }
  getFilteredEmojis() {
    return this.allEmojis.filter((e) => {
      if (this.filterEmojis === '') {
        return true;
      } else {
        for (let alias of e.aliases) {
          if (alias.includes(this.filterEmojis)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  onEmojiClick(e) {
    this.input = this.input + e;
    this.modelChange.emit(this.input);
    this.emojiClick.emit(e);
    this.firstClickOutside = true;
    this.popupOpen = false;
    this.clean();
  }

  clickOutside(event) {
    if (!this.popupOpen) {
      return;
    }

    if (!this.firstClickOutside) {
      this.popupOpen = false;
      this.clean();
      this.firstClickOutside = true;
      return;
    }

    this.firstClickOutside = false;
  }

  onChange(newValue) {
    this.input = this.emojiService.emojify(newValue);
    this.model = this.input;
    this.modelChange.emit(this.input);
  }
}
