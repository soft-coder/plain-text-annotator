import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { delay, filter, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AnnotationPopoverAnchor } from './annotation-popover-anchor';
import { ArticleViewState } from './article-view-state';

type MouseEnterAnnotation = { event: MouseEvent, id: string };

@Injectable()
export class AnnotationPopoverActivator {
  private readonly state = inject(ArticleViewState);

  private readonly popoverAnchor = inject(AnnotationPopoverAnchor);

  private readonly _resetCommentTrigger = signal(false);

  readonly resetCommentTrigger = this._resetCommentTrigger.asReadonly();

  private readonly _mouseInsidePopover = signal(false);

  private readonly mouseEnterAnnotation$$ = new Subject<MouseEnterAnnotation | null>();

  constructor() {
    this.wathMouseEnterAnnotation();
  }

  onEnterAnnotation($event: MouseEvent, id: string) {
    this.mouseEnterAnnotation$$.next({event: $event, id: id})
  }

  onLeaveAnnotation() {
    this.mouseEnterAnnotation$$.next(null);
  }

  onPopoverEnter() {
    this._mouseInsidePopover.set(true);
  }

  onPopoverLeave() {
    this._mouseInsidePopover.set(false);
    this.mouseEnterAnnotation$$.next(null);
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
            filter(() => !this._mouseInsidePopover())
          );
        }
      }),
      tap((data: MouseEnterAnnotation | null) => {
        this._resetCommentTrigger.set(true);
        if (data) {
          this.showPopover(data);
        } else {
          this.hidePopover();
        }
      }),
      takeUntilDestroyed()
    ).subscribe();
  }


  private hidePopover() {
    this.state.annotationId.set(null);
    this.popoverAnchor.clearAnchor();
  }

  private showPopover(data: MouseEnterAnnotation) {
    this.state.annotationId.set(data.id);
    const target = data.event.target as HTMLSpanElement;
    this.popoverAnchor.calcElementAnchor(target);
  }
}