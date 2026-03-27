import { Component, output, model, effect, input } from '@angular/core';
import { ColorPicker, EditableText } from '@pta/ui';
import { debounceSignal } from '@pta/util';

@Component({
  selector: 'pta-annotation-editor',
  imports: [ColorPicker, EditableText],
  templateUrl: 'annotation-editor.html',
  styleUrl: 'annotation-editor.scss'
 })
export class AnnotationEditor {
  activeColor = input('#ffeb3b');

  comment = model('');

  debouncedComment = debounceSignal(this.comment, 500);

  constructor() {
    effect(() => {
      const text = this.debouncedComment();
      if (text) {
        this.updateComment.emit(text);
      }
    });
  }
  updateComment = output<string>();
  updateColor = output<string>();
}
