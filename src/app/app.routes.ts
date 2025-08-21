import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./pages/signup/signup.component').then(
            (m) => m.SignupComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
