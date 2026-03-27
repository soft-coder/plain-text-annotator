import { Routes } from '@angular/router';
import { Articles } from './articles/articles/articles';

export const routes: Routes = [
  {
    path: '',
    component: Articles,
    pathMatch: 'full'
  }
];