import {
  inject,
  Injectable, Renderer2,
  RendererFactory2,
  signal
} from '@angular/core';
import { AnnotationPopoverAnchor } from './annotation-popover-anchor';

export type PendingRange = { start: number, end: number, text: string };

export type PopoverAnchor = { top: number, left: number };

@Injectable()
export class ArticleViewSelector {
  private readonly annotationPopoverAnchor = inject(AnnotationPopoverAnchor);

  private readonly renderer: Renderer2;

  private readonly _pendingRange = signal<PendingRange | null>(null);

  readonly pendingRange = this._pendingRange.asReadonly();

  private readonly isSelecting = signal(false);

  private readonly initialSegment = signal<HTMLSpanElement | null>(null);

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.renderer.listen('window', 'mouseup', () => {
      this.clearNoSelect();
    });
  }

  clearPendingRange() {
    this._pendingRange.set(null);
  }

  onMouseDownArticleContent(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const container = target.closest('.article-body');
    if (!container) return;

    const allElements = Array.from(
      container.querySelectorAll('.annotation-highlight, .text-segment')
    );
    const clickedIndex = allElements.indexOf(target);

    allElements.forEach((el, idx) => {
      if (idx !== clickedIndex) {
        el.classList.add('no-select');
      }
    });
    this.isSelecting.set(true);
  }

  onMouseDownTextSegment($event: MouseEvent) {
    const currentTarget = $event.currentTarget as HTMLSpanElement;
    this.initialSegment.set(currentTarget);
  }

  private onEndSelection() {
    const selection = window.getSelection();
    const initialSegment = this.initialSegment();
    if (selection && !selection.isCollapsed && initialSegment) {
      const range = selection.getRangeAt(0);

      const preSelectionRange = range.cloneRange();
      const container = document.querySelector('.article-body');
      preSelectionRange.selectNodeContents(container!);
      preSelectionRange.setEnd(range.startContainer, range.startOffset)

      const limitStart = parseInt(initialSegment.getAttribute('data-start') || '0');
      const limitEnd = parseInt(initialSegment.getAttribute('data-end') || '0');

      let start = preSelectionRange.toString().length;
      const text = selection.toString();
      let end = start + text.length;

      if (start < limitStart) start = limitStart;
      if (end > limitEnd) end = limitEnd;

      this.annotationPopoverAnchor.calcSelectionAnchor(range)
      this._pendingRange.set({ start, end, text });
    }
  }

  private clearNoSelect() {
    const elements = document.querySelectorAll('.article-body .no-select');
    elements.forEach(el => {
      el.classList.remove('no-select')
    });
    if (this.isSelecting()) {
      this.isSelecting.set(false);
      this.onEndSelection();
    }
  }
}