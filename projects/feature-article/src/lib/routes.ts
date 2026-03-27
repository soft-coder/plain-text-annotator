import { Routes } from '@angular/router';
import { ArticleEdit } from './article-edit/article-edit';
import { ArticleView } from './article-view/article-view';
import { Articles } from './articles/articles';

export const routes: Routes = [
  {
    path: '',
    component: Articles,
    pathMatch: 'full'
  },
  {
    path: 'edit/:id',
    component: ArticleEdit
  },
  {
    path: ':id',
    component: ArticleView
  }
];