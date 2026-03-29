import { FormsModule } from '@angular/forms';
import { Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'pta-editable-text',
  imports: [FormsModule],
  templateUrl: './editable-text.html',
  styleUrl: './editable-text.scss',
})
export class EditableText {
  initialValue = input<string | null>(null);

  placeholder = input<string>('');

  showStyleOnFocus = input<boolean>(false);

  valueChange = output<string>();

  private localValue = signal<string | null>(null);

  protected currentValue = computed(() => {
    const localValue = this.localValue();
    if (localValue !== null) {
      return localValue;
    } else {
      return this.initialValue() ?? '';
    }
  })

  protected onChange($event: string) {
    this.localValue.set($event);
    this.valueChange.emit($event);
  }

  reset() {
    this.localValue.set(null);
  }
}
