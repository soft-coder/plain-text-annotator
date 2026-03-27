import { Component, input, output } from '@angular/core';

@Component({
  selector: 'button[pta-button]',
  standalone: true,
  templateUrl: 'button.html',
  host: {
    '[class]': 'variant()',
    '[type]': 'type()'
  }
})
export class Button {
  variant = input<'primary' | 'danger'>('primary');

  type = input<'button' | 'submit' | 'reset'>('button');
}