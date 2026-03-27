import { Component, input, output } from '@angular/core';

@Component({
  selector: 'pta-color-picker',
  templateUrl: 'color-picker.html',
  styleUrl: 'color-picker.scss'
})
export class ColorPicker {
  value = input<string>('');

  presets = input<string[]>([
    '#D32F2F',
    '#1976D2',
    '#388E3C',
    '#FBC02D',
    '#7B1FA2',
  ]);

  select = output<string>();
}
