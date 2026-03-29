import {
  Component,
  inject,
  computed,
  input,
  HostListener,
  signal, viewChild, DOCUMENT
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { Button, Popover } from '@pta/ui';
import { AnnotationEditor } from '../annotation/annotation-editor/annotation-editor';
import { AnnotationTextProcessor } from '../annotation/annotation-text-processor';
import { ANNOTATION_COLORS } from '../annotation/color-config';

type PendingRange = { start: number, end: number, text: string };

type PopoverAnchor = { top: number, left: number };

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

  private annotationEditor = viewChild(AnnotationEditor);

  private isSelecting = signal(false);

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


  onEndSelection() {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);

      const preSelectionRange = range.cloneRange();
      const container = document.querySelector('.article-body');
      preSelectionRange.selectNodeContents(container!);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);

      const start = preSelectionRange.toString().length;
      const text = selection.toString();

      this.pendingRange.set({
        start,
        end: start + text.length,
        text
      });

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
    this.annotationEditor()?.resetComment();
    this.annotationId.set(id);
    const target = $event.target as HTMLSpanElement;
    const clientRects = target.getClientRects();
    const anchor = this.calcAnchor(
      clientRects[clientRects.length - 1],
      target
    );
    this.anchor.set(anchor);
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

}
