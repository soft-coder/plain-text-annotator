import { FormsModule } from '@angular/forms';
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'pta-editable-text',
  imports: [FormsModule],
  templateUrl: './editable-text.html',
  styleUrl: './editable-text.scss',
})
export class EditableText {
  value = model<string>('');

  placeholder = input<string>('');

  showStyleOnFocus = input<boolean>(false);
}
