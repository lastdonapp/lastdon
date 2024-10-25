import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  constructor(private readonly router: Router) { }

  ngOnInit() {
    // Redirigir a la página de información por defecto
    this.router.navigate(['/menu/informacion']);


      // vista solo accesible para user normal
      const userStorage = localStorage.getItem('userType');
      if (userStorage !== 'normal') {
        this.router.navigate(['/login']);
      }




  }








}
