import {
  Component,
  inject,
  computed,
  input,
  HostListener,
  signal, viewChild
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { Button, Popover } from '@pta/ui';
import { AnnotationEditor } from '../annotation/annotation-editor/annotation-editor';
import { AnnotationTextProcessor } from '../annotation/annotation-text-processor';
import { ANNOTATION_COLORS } from '../annotation/color-config';

type PendingRange = { start: number, end: number, text: string };

@Component({
  selector: 'pta-article-view',
  standalone: true,
  imports: [Button, RouterLink, AnnotationEditor, Popover],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss',
  preserveWhitespaces: false
})
export class ArticleView {
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

  protected selectionRect = signal<DOMRect | null>(null);

  private annotationEditor = viewChild(AnnotationEditor);

  @HostListener('window:mouseup')
  clearNoSelect() {
    const elements = document.querySelectorAll('.article-body .no-select');
    elements.forEach(el => {
      el.classList.remove('no-select')
    });
  }

  @HostListener('document:scroll')
  hideAnnotationPopover() {
    if (this.selectionRect()) {
      this.selectionRect.set(null);
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
  }


  onMouseUpTextSegment() {
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

      this.selectionRect.set(range.getBoundingClientRect());
      this.addAnnotation();
    }
  }

  onMouseEnterAnnotation($event: MouseEvent, id: string) {
    this.annotationEditor()?.resetComment();
    this.annotationId.set(id);
    const target = $event.target as HTMLSpanElement;
    const clientRects = target.getClientRects();
    this.selectionRect.set(clientRects[clientRects.length - 1]);
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
      this.selectionRect.set(null);
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
