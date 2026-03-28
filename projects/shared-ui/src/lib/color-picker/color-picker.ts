import { Component, input, output } from '@angular/core';

@Component({
  selector: 'pta-color-picker',
  templateUrl: 'color-picker.html',
  styleUrl: 'color-picker.scss'
})
export class ColorPicker {
  value = input<string>('');

  presets = input<readonly string[]>();

  select = output<string>();
}
