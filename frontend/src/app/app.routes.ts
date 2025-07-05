import { Routes } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AboutComponent } from './pages/about/about.component';
import { HomeComponent } from './pages/home/home.component';
import { Signup } from './pages/signup/signup';
import { Layout } from './shared/layout/layout';
import { Quiz } from './pages/quiz/quiz.component';
import { SigninComponent } from './pages/signin/signin.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    component: Layout, // Wrapper with Navbar + Footer
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'signup', component: Signup },
      { path: 'signin', component: SigninComponent },
    ],
  },
  { path: 'about', component: AboutComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'signup', component: Signup },
  { path: 'quiz', component: Quiz },
];
