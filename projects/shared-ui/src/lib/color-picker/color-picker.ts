import { Component, input, output } from '@angular/core';

@Component({
  selector: 'pta-color-picker',
  standalone: true,
  templateUrl: 'color-picker.html',
  styleUrl: 'color-picker.scss'
})
export class ColorPicker {
  value = input<string>('');

  presets = input<string[]>([
    '#ffeb3b',
    '#ffccbc',
    '#c8e6c9',
    '#bbdeff',
    '#e1bee7'
  ]);

  select = output<string>();
}
