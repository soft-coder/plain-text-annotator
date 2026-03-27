import { Component, inject, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { Button } from '@pta/ui';

@Component({
  selector: 'pta-article-view',
  standalone: true,
  imports: [Button, RouterLink],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss'
})
export class ArticleView {
  // Input от роутера (withComponentInputBinding)
  id = input.required<string>();

  private facade = inject(ArticleFacade);
  private router = inject(Router);

  protected article = computed(() =>
    this.facade.articles().find(a => a.id === this.id())
  );

  goBack() {
    this.router.navigate(['/']);
  }

  delete() {
    this.facade.delete(this.id());
    this.goBack();
  }
}
