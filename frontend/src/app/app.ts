import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HeroComponent } from './shared/hero/hero.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , NavbarComponent , HeroComponent , FooterComponent] ,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'Price-Pulse';
}
