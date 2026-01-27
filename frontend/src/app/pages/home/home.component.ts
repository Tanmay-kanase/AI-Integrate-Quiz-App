import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HeroComponent } from '../../shared/hero/hero.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { QuizzesComponent } from '../../shared/quizzes/quizzes.component';
import { Landpage } from '../../shared/landpage/landpage';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    QuizzesComponent,
    HeroComponent,
    FooterComponent,
    Landpage,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  isLoggedIn = false;

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    this.isLoggedIn = !!user; // true if logged in
  }
}
