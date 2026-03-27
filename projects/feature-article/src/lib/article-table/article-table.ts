import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticlePreviewModel } from '@pta/model';
import { Button, Table } from '@pta/ui';

@Component({
  selector: 'pta-article-table',
  imports: [Table, Button, RouterLink],
  templateUrl: 'article-table.html',
  styleUrl: 'article-table.scss'
})
export class ArticleTable {
  articles = input<ArticlePreviewModel[]>([]);
}
