import { inject, Injectable } from '@angular/core';
import { ArticleModel } from '@pta/model';
import { LocalStorage } from '@pta/util';

@Injectable({
  providedIn: 'root',
})
export class ArticleStorage {
  private readonly KEY = 'pta_articles';

  private localStorage = inject(LocalStorage);

  save(articles: ArticleModel[]): void {
    this.localStorage.setItem(this.KEY, articles);
  }

  load(): ArticleModel[] {
    const data = this.localStorage.getItem<ArticleModel[]>(this.KEY);
    return data ? data : [];
  }
}
