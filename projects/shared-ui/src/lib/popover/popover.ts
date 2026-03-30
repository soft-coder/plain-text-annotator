import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'pta-popover',
  imports: [],
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
})
export class Popover {
  anchor = input.required<{ top: number, left: number} | null>();

  top = computed(() => (this.anchor()?.top ?? 0));
  left = computed(() => (this.anchor()?.left ?? 0));
}
