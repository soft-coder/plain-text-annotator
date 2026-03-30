import { Injectable } from '@angular/core';
import { AnnotationModel, TextSegment } from '@pta/model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationTextProcessor {
  splitText(content: string, annotations: AnnotationModel[]): TextSegment[] {
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
