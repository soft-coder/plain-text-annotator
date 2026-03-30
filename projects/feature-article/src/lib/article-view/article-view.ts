import {
  Component,
  inject,
  computed,
  input,
  HostListener,
  signal, viewChild, DOCUMENT
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { Button, Popover } from '@pta/ui';
import { delay, filter, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AnnotationEditor } from '../annotation/annotation-editor/annotation-editor';
import { AnnotationTextProcessor } from '../annotation/annotation-text-processor';
import { ANNOTATION_COLORS } from '../annotation/color-config';

type PendingRange = { start: number, end: number, text: string };

type PopoverAnchor = { top: number, left: number };

type MouseEnterAnnotation = { event: MouseEvent, id: string };

@Component({
  selector: 'pta-article-view',
  standalone: true,
  imports: [Button, RouterLink, AnnotationEditor, Popover],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss',
  preserveWhitespaces: false
})
export class ArticleView {
  private readonly document = inject(DOCUMENT);

  private readonly annotationColor = inject(ANNOTATION_COLORS);

  private readonly annotationTextProcessor = inject(AnnotationTextProcessor);

  // Input от роутера (withComponentInputBinding)
  id = input.required<string>();

  private facade = inject(ArticleFacade);
  private router = inject(Router);

  protected article = computed(() =>
    this.facade.articles().find(a => a.id === this.id())
  );

  protected segments = computed(() => {
    const article = this.article();
    if (!article || !article.content) return [];
    return this.annotationTextProcessor.splitText(
      article.content,
      article.annotations
    );
  });

  protected annotationId = signal<string | null>(null);
  
  protected annotation = computed(() => {
    const article = this.article();
    const annotationId = this.annotationId()
    if (article && annotationId) {
      return article.annotations.find(a => a.id === annotationId) || null
    } else {
      return null;
    }
  })

  private pendingRange = signal<PendingRange | null>(null);

  protected anchor = signal<PopoverAnchor | null>(null);

  protected mouseInsidePopover = signal(false);

  private annotationEditor = viewChild(AnnotationEditor);

  private isSelecting = signal(false);

  private initialSegment = signal<HTMLSpanElement | null>(null);

  private mouseEnterAnnotation$$ = new Subject<MouseEnterAnnotation | null>();

  constructor() {
    this.wathMouseEnterAnnotation();
  }

  @HostListener('window:mouseup')
  clearNoSelect() {
    const elements = document.querySelectorAll('.article-body .no-select');
    elements.forEach(el => {
      el.classList.remove('no-select')
    });
    if (this.isSelecting()) {
      this.isSelecting.set(false);
      this.onEndSelection();
    }
  }

  @HostListener('document:scroll')
  hideAnnotationPopover() {
    if (this.anchor()) {
      this.anchor.set(null);
    }
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



  onEndSelection() {
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

      this.pendingRange.set({ start, end, text });

      const clientRects = range.getClientRects();
      const endNode = range.endContainer;
      let endElement: HTMLElement;
      if (endNode.nodeType === Node.TEXT_NODE) {
        endElement = endNode.parentElement!;
      } else {
        endElement = endNode as HTMLElement;
      }
      const anchor = this.calcAnchor(
        clientRects[clientRects.length - 1],
        endElement
      );
      this.anchor.set(anchor);
      this.addAnnotation();
    }
  }

  private calcAnchor(rect: DOMRect, element: Element): PopoverAnchor {
    const computedStyle = getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const rootStyles = getComputedStyle(this.document.documentElement);
    const arrowSizeRem = parseFloat(rootStyles.getPropertyValue('--pta-size-arrow'));
    const rootFontSize = parseFloat(rootStyles.fontSize);
    const arrowSizePx = rootFontSize * arrowSizeRem;
    const gapTop = (lineHeight - fontSize) / 2;
    return {
      top: rect.top + gapTop + arrowSizePx,
      left: rect.left
    };
  }

  onMouseEnterAnnotation($event: MouseEvent, id: string) {
    this.mouseEnterAnnotation$$.next({event: $event, id: id})
  }

  onMouseLeaveAnnotation() {
    this.mouseEnterAnnotation$$.next(null);
  }

  onPopoverLeave() {
    this.mouseInsidePopover.set(false);
    this.mouseEnterAnnotation$$.next(null);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  delete() {
    this.facade.delete(this.id());
    this.goBack();
  }

  addAnnotation() {
    const range = this.pendingRange();
    if (range) {
      const { start, end } = range;
      const id = this.facade.addAnnotation(
        this.id(),
        start,
        end,
        this.annotationColor.defaultColor
      );
      this.annotationEditor()?.resetComment();
      this.annotationId.set(id);
      this.anchor.set(null);
      window.getSelection()?.removeAllRanges();
    }
  }

  updateAnnotationColor(color: string) {
    const annotationId = this.annotationId();
    if (annotationId) {
      this.facade.updateAnnotationColor(
        this.id(),
        annotationId,
        color
      );
    }
  }

  updateAnnotationComment(comment: string) {
    const annotationId = this.annotationId();
    if (annotationId) {
      this.facade.updateAnnotationComment(
        this.id(),
        annotationId,
        comment
      );
    }
  }

  private wathMouseEnterAnnotation() {
    this.mouseEnterAnnotation$$.pipe(
      switchMap(data => {
        if (data) {
          return of(data).pipe(
            delay(200),
            takeUntil(this.mouseEnterAnnotation$$.pipe(filter(v => v === null)))
          );
        } else {
          return of(null).pipe(
            delay(300),
            filter(() => !this.mouseInsidePopover())
          );
        }
      }),
      tap((data: MouseEnterAnnotation | null) => {
        if (data) {
          this.annotationEditor()?.resetComment();
          this.annotationId.set(data.id);
          const target = data.event.target as HTMLSpanElement;
          const clientRects = target.getClientRects();
          const anchor = this.calcAnchor(
            clientRects[clientRects.length - 1],
            target
          );
          this.anchor.set(anchor);
        } else {
          this.annotationEditor()?.resetComment();
          this.annotationId.set(null);
          this.anchor.set(null);
        }
      }),
      takeUntilDestroyed()
    ).subscribe();
  }

}
