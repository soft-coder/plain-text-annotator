import { computed, inject, Injectable } from '@angular/core';
import { AnnotationModel, TextSegment } from '@pta/model';
import { ArticleViewState } from './article-view-state';

@Injectable()
export class ArticleViewTextProcessor {
  private readonly state = inject(ArticleViewState);

  segments = computed(() => {
    const article = this.state.article();
    if (!article || !article.content) return [];
    return this.splitText(
      article.content,
      article.annotations
    );
  });

  private splitText(content: string, annotations: AnnotationModel[]): TextSegment[] {
    if (!content) return [];

    const sorted = [...annotations].sort((a, b) => a.start - b.start);
    const segments: TextSegment[] = [];
    let lastIndex = 0;

    for (const annotation of sorted) {
      if (annotation.start > lastIndex) {
        segments.push({
          text: content.substring(lastIndex, annotation.start),
          start: lastIndex,
          end: annotation.start
        });
      }
      segments.push({
        start: annotation.start,
        end: annotation.end,
        text: content.substring(annotation.start, annotation.end),
        annotation: annotation
      });
      lastIndex = annotation.end;
    }

    if (lastIndex < content.length) {
      segments.push({
        start: lastIndex,
        end: content.length,
        text: content.substring(lastIndex)
      });
    }

    return segments;
  }
}
