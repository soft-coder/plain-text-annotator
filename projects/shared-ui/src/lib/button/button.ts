import { Component, input } from '@angular/core';

@Component({
  selector: 'button[pta-button]',
  standalone: true,
  templateUrl: 'button.html',
  styleUrl: 'button.scss',
  host: {
    '[class]': 'variant()',
    '[type]': 'type()'
  }
})
export class Button {
  variant = input<'primary' | 'danger'>('primary');

  type = input<'button' | 'submit' | 'reset'>('button');
}