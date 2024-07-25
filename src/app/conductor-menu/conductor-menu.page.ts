import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conductor-menu',
  templateUrl: './conductor-menu.page.html',
  styleUrls: ['./conductor-menu.page.scss'],
})
export class ConductorMenuPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Redirigir a la página de "Mis Pedidos" por defecto
    this.router.navigate(['/conductor-menu/mis-pedidos']);
  }
}
