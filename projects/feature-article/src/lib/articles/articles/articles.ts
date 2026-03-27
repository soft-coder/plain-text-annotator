import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { ArticleTable } from '../article-table/article-table';
import { Button } from '@pta/ui';

@Component({
  selector: 'pta-articles',
  imports: [ArticleTable, Button],
  templateUrl: 'articles.html',
  styleUrl: 'articles.scss'
})
export class Articles {
  protected facade = inject(ArticleFacade);

  private router = inject(Router);

  goToCreate() {
    this.router.navigate(['/edit', 'new']);
  }
}
