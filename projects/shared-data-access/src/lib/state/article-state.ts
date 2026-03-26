import { effect, inject, Injectable, signal } from '@angular/core';
import { ArticleModel } from '@pta/model';
import { ArticleStorage } from '../infrastructure/article-storage';

@Injectable({
  providedIn: 'root',
})
export class ArticleState {
  private storage = inject(ArticleStorage);

  private _articles = signal<ArticleModel[]>(this.storage.load());

  public articles = this._articles.asReadonly();

  constructor() {
    effect(() => {
      this.storage.save(this._articles());
    });
  }

  update(fn: (articles: ArticleModel[]) => ArticleModel[]): void {
    this._articles.update(fn);
  }
}
