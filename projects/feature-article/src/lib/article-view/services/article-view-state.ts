import {
  computed,
  inject,
  Injectable,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { map } from 'rxjs';

@Injectable()
export class ArticleViewState {
  private readonly route = inject(ActivatedRoute);

  private facade = inject(ArticleFacade);

  id = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')!))
  );

  article = computed(() =>
    this.facade.articles().find(a => a.id === this.id())
  );

  annotations = computed(() => {
    return this.article()?.annotations ?? null;
  })

  annotationId = signal<string | null>(null);

  annotation = computed(() => {
    const annotations = this.annotations();
    const annotationId = this.annotationId()
    if (annotations && annotationId) {
      return annotations.find(a => a.id === annotationId) || null
    } else {
      return null;
    }
  })

}