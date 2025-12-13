import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./budget/budget').then(m => m.Budget)
  },
];
