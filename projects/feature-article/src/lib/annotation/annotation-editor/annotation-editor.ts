import {
  Component,
  output,
  effect,
  input,
  signal,
  inject, viewChild
} from '@angular/core';
import { ColorPicker, EditableText } from '@pta/ui';
import { debounceSignal } from '@pta/util';
import { ANNOTATION_COLORS } from '../color-config';

@Component({
  selector: 'pta-annotation-editor',
  imports: [ColorPicker, EditableText],
  templateUrl: 'annotation-editor.html',
  styleUrl: 'annotation-editor.scss'
 })
export class AnnotationEditor {
  private colorConfig = inject(ANNOTATION_COLORS)

  color = input(this.colorConfig.defaultColor, {
    transform: (v: string | null | undefined) => v ?? this.colorConfig.defaultColor
  });

  initialComment = input<string | null>(null);

  updateComment = output<string>();

  updateColor = output<string>();

  protected colorPresets = signal(this.colorConfig.presets);

  private currentComment = signal<string | null>(null);

  private debouncedComment = debounceSignal(this.currentComment, 500);

  private editableText = viewChild(EditableText);

  constructor() {
    effect(() => {
      const text = this.debouncedComment();
      if (text) {
        this.updateComment.emit(text);
      }
    });
  }

  resetComment() {
    this.editableText()?.reset()
  }

  protected onChangeComment($event: string) {
    this.currentComment.set($event);
  }
}
