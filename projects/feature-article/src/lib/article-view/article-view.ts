import {
  Component,
  inject,
  viewChild, effect, untracked
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { AnnotationModel } from '@pta/model';
import { Button, Popover } from '@pta/ui';
import { AnnotationEditor } from '../annotation/annotation-editor/annotation-editor';
import { AnnotationPopoverActivator } from './services/annotation-popover-activator';
import { AnnotationPopoverAnchor } from './services/annotation-popover-anchor';
import { ArticleViewSelector, PendingRange } from './services/article-view-selector';
import { ArticleViewTextProcessor } from './services/article-view-text-processor';
import { ANNOTATION_COLORS } from '../annotation/color-config';
import { ArticleViewState } from './services/article-view-state';

@Component({
  selector: 'pta-article-view',
  standalone: true,
  imports: [Button, RouterLink, AnnotationEditor, Popover],
  providers: [
    ArticleViewState,
    ArticleViewTextProcessor,
    ArticleViewSelector,
    AnnotationPopoverAnchor,
    AnnotationPopoverActivator
  ],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss',
  preserveWhitespaces: false
})
export class ArticleView {
  private readonly annotationColor = inject(ANNOTATION_COLORS);

  private readonly articleViewTextProcessor = inject(ArticleViewTextProcessor);

  private readonly articleViewSelector = inject(ArticleViewSelector);

  private readonly annotationPopoverAnchor = inject(AnnotationPopoverAnchor);

  private readonly annotationPopoverActivator = inject(AnnotationPopoverActivator);

  protected readonly state = inject(ArticleViewState);

  private facade = inject(ArticleFacade);

  private router = inject(Router);

  protected article = this.state.article;

  protected annotation = this.state.annotation;

  protected segments = this.articleViewTextProcessor.segments;

  protected anchor = this.annotationPopoverAnchor.anchor;

  private pendingRange = this.articleViewSelector.pendingRange;

  private annotationEditor = viewChild(AnnotationEditor);

  constructor() {
    effect(() => {
      const pendingRange = this.pendingRange();
      if (pendingRange) {
        const id = this.addAnnotation(pendingRange);
        untracked(() => {
          this.annotationEditor()?.resetComment();
          this.state.annotationId.set(id);
          window.getSelection()?.removeAllRanges();
          this.articleViewSelector.clearPendingRange()
        })
      }
    });
    effect(() => {
      const reset = this.annotationPopoverActivator.resetCommentTrigger();
      if (reset) {
        this.annotationEditor()?.resetComment();
      }
    });
  }

  onMouseDownArticleContent($event: MouseEvent) {
    this.articleViewSelector.onMouseDownArticleContent($event);
  }

  onMouseDownTextSegment($event: MouseEvent) {
    this.articleViewSelector.onMouseDownTextSegment($event);
  }


  onEnterAnnotation($event: MouseEvent, id: string) {
    this.annotationPopoverActivator.onEnterAnnotation($event, id);
  }

  onLeaveAnnotation() {
    this.annotationPopoverActivator.onLeaveAnnotation();
  }

  onPopoverEnter() {
    this.annotationPopoverActivator.onPopoverEnter();
  }

  onPopoverLeave() {
    this.annotationPopoverActivator.onPopoverLeave();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  delete() {
    this.facade.delete(this.state.id()!);
    this.goBack();
  }

  addAnnotation(range: PendingRange): string {
    const { start, end } = range;
    const color = this.calcAnnotationDefaultColor(start, end);
    return this.facade.addAnnotation(
      this.state.id()!,
      start,
      end,
      color
    );
  }

  calcAnnotationDefaultColor(start: number, end: number) {
    const annotations = this.state.annotations() || [];
    return this.getRandomAnnotationColor(
      this.findLeftNeighborColor(annotations, start),
      this.findRightNeighborColor(annotations, end)
    );
  }

  private findLeftNeighborColor(
    annotations: AnnotationModel[],
    start: number
  ): string | null {
    let leftNeighborColor: string | null = null;
    let lastEnd = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < annotations.length; i++) {
      const a = annotations[i];
      if (a.end < start && a.end > lastEnd) {
        lastEnd = a.end;
        leftNeighborColor = a.color;
      }
    }
    return leftNeighborColor;
  }

  private findRightNeighborColor(
    annotations: AnnotationModel[],
    end: number
  ): string | null{
    let rightNeighborColor: string | null = null;
    let lastStart = Number.POSITIVE_INFINITY;
    for (let i = annotations.length - 1; i >= 0; i--) {
      const a = annotations[i];
      if (end < a.start && a.start < lastStart) {
        lastStart = a.start;
        rightNeighborColor = a.color;
      }
    }
    return rightNeighborColor;
  }

  private getRandomAnnotationColor(
    leftNeighborColor: string | null,
    rightNeighborColor: string | null
  ): string {
    const filteredColors =  this.annotationColor.presets.filter(c => {
      return c !== leftNeighborColor && c !== rightNeighborColor;
    })
    return filteredColors[Math.floor(Math.random() * filteredColors.length)]
  }

  updateAnnotationColor(color: string) {
    const annotationId = this.state.annotationId();
    if (annotationId) {
      this.facade.updateAnnotationColor(
        this.state.id()!,
        annotationId,
        color
      );
    }
  }

  updateAnnotationComment(comment: string) {
    const annotationId = this.state.annotationId();
    if (annotationId) {
      this.facade.updateAnnotationComment(
        this.state.id()!,
        annotationId,
        comment
      );
    }
  }
}
