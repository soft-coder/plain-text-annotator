import { Component, inject, signal, effect, input } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ArticleFacade } from '@pta/data-access';
import { Button, Input, Textarea } from '@pta/ui';

@Component({
  selector: 'pta-article-edit',
  standalone: true,
  imports: [Button, Input, Textarea, FormField],
  templateUrl: 'article-edit.html',
  styleUrl: 'article-edit.scss'
})
export class ArticleEdit {
  // route input -  withComponentInputBinding
  id = input.required<string>();

  protected facade = inject(ArticleFacade);
  private router = inject(Router);

  articleData = signal({ title: '', content: '' });

  articleForm = form(this.articleData, (schemaPath) => {
    required(schemaPath.title);
    required(schemaPath.content);
  });

  protected isNew = signal(true);

  constructor() {
    effect(() => {
      const currentId = this.id();
      if (currentId !== 'new') {
        this.isNew.set(false);
        const article = this.facade.articles().find(a => a.id === currentId);
        if (article) {
          this.articleData.set({ title: article.title, content: article.content });
        }
      }
    }, { allowSignalWrites: true });
  }

  save() {
    const { title, content } = this.articleData();
    let articleId: string;
    if (this.isNew()) {
      articleId = this.facade.create(title, content);
    } else {
      articleId = this.id()
      this.facade.update(this.id(), title, content);
    }
    this.router.navigate([`/${articleId}`]);
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
