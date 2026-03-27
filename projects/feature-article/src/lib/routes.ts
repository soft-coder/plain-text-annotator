import { Routes } from '@angular/router';
import { ArticleEdit } from './article-edit/article-edit/article-edit';
import { Articles } from './articles/articles/articles';

export const routes: Routes = [
  {
    path: '',
    component: Articles,
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: ArticleEdit
  }
];