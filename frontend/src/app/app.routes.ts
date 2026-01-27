import { Routes } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { Signup } from './pages/signup/signup';
import { Layout } from './shared/layout/layout';
import { QuizComponent } from './pages/Quiz/quiz/quiz.component';
import { SigninComponent } from './pages/signin/signin.component';
import { AppLoading } from './shared/app-loading/app-loading';
import { ProfileComponent } from './pages/profile/profile.component';
import { CreateQuizComponent } from './pages/Quiz/createQuiz/createQuiz';
import { AddQuestionsComponent } from './pages/Quiz/questions/add-questions';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    component: Layout, // Wrapper with Navbar + Footer
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      {
        path: 'signup',
        component: Signup,
      },
      {
        path: 'signin',
        component: SigninComponent,
      },
      {
        canActivate: [authGuard],
        path: 'create-quiz',
        component: CreateQuizComponent,
      },
      {
        canActivate: [authGuard],
        path: 'add-questions',
        loadComponent: () =>
          import('./pages/Quiz/questions/add-questions').then(
            (m) => m.AddQuestionsComponent,
          ),
      },
    ],
  },
  { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
  { path: 'about', canActivate: [authGuard], component: AboutComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'signup', component: Signup },
  { path: 'quiz', canActivate: [authGuard], component: QuizComponent },
  { path: 'loading', component: AppLoading },
  {
    path: 'add-questions',
    canActivate: [authGuard],
    component: AddQuestionsComponent,
  },
];
