import { Component, input } from '@angular/core';
import { ArticlePreviewModel } from '@pta/model';
import { Table } from '@pta/ui';

@Component({
  selector: 'pta-article-table',
  standalone: true,
  imports: [Table],
  templateUrl: 'article-table.html',
  styleUrl: 'article-table.scss'
})
export class ArticleTable {
  articles = input<ArticlePreviewModel[]>([]);
}
