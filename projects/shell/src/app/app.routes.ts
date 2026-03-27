import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'article',
    loadChildren: () => import('@pta/feature-article').then(m => m.routes)
  },
  {
    path: '**', redirectTo: 'article', pathMatch: 'full'
  }
];
