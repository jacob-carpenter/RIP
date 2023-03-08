import {Component} from '@angular/core';

@Component({
  selector: 'token-count',
  templateUrl: './token-count.component.html',
  styleUrls: ['./token-count.component.scss']
})
export class TokenCountComponent {
  tokenCount: number = 32;
  lowTokenCount: number = 10;
  medTokenCount: number = 20;
}
