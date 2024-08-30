import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.page.html',
  styleUrls: ['./admin-menu.page.scss'],
})
export class AdminMenuPage implements OnInit {

  constructor( private router: Router) { }

  ngOnInit() {


          // vista solo accesible para user admin
          const userStorage = localStorage.getItem('userType');
          if (userStorage !== 'admin') {
            this.router.navigate(['/login']);
          }
    


  }

}
