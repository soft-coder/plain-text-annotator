import { Component, input } from '@angular/core';

@Component({
  selector: 'textarea[pta-textarea]',
  standalone: true,
  template: '',
  styleUrl: 'textarea.scss',
  host: {
    '[rows]': 'rows()'
  }
})
export class Textarea {
  rows = input<number>(5);
}
