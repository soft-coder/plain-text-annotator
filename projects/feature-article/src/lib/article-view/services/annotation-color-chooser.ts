import { inject, Injectable } from '@angular/core';
import { AnnotationModel } from '@pta/model';
import { ANNOTATION_COLORS } from '../../annotation/color-config';
import { ArticleViewState } from './article-view-state';

@Injectable()
export class AnnotationColorChooser {
  private readonly annotationColor = inject(ANNOTATION_COLORS);

  protected readonly state = inject(ArticleViewState);

  calcAnnotationInitialColor(start: number, end: number) {
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
}