import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-conductor-menu',
  templateUrl: './conductor-menu.page.html',
  styleUrls: ['./conductor-menu.page.scss'],
})
export class ConductorMenuPage implements OnInit {
  currentUser: any ={};
  currentTitle: string = 'Bienvenido';  // Título por defecto
  constructor(private readonly router: Router) { }

  ngOnInit() {
    // Cargar la información del usuario logueado primero
    this.currentUser = this.getCurrentUser();

    // Redirigir a la página de "Mis Pedidos" por defecto
    this.router.navigate(['/conductor-menu/mis-pedidos']);

    // vista solo accesible para user conductor
    const userStorage = localStorage.getItem('userType');
    if (userStorage !== 'conductor') {
      this.router.navigate(['/login']);
    }
    
    // Detectar cambios de ruta y actualizar el título
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)  // Filtrar para eventos de tipo NavigationEnd
      )
      .subscribe((event) => {
        // Realizamos el type assertion aquí
        const navigationEndEvent = event as NavigationEnd;
        this.updateTitle(navigationEndEvent.urlAfterRedirects);  // Actualizar el título con la URL
      });

  }

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Función para actualizar el título según la URL
  updateTitle(url: string) {
    switch (url) {
      case '/conductor-menu/mis-pedidos':
        this.currentTitle = 'Mis Entregas';
        break;
      case '/conductor-menu/agregar-pedidos':
        this.currentTitle = 'Agregar Pedido';
        break;
      case '/conductor-menu/perfil':
        this.currentTitle = 'Perfil';
        break;
      default:
        this.currentTitle = 'Bienvenido';
        break;
    }
  }

  public sanitizeEmail(email: string): string {
    // Cortar el email antes del símbolo @
    const username = email.split('@')[0];
  
  // Convertir la primera letra a mayúsculas y las demás a minúsculas
  const sanitizedUsername = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  
  return sanitizedUsername;
  }

    // Método para obtener el tipo de usuario desde currentUser
    getUserType() {
      if (this.currentUser && this.currentUser['user-type']) {
        return this.currentUser['user-type'] === 'conductor' ? 'Conductor' : 'Usuario';
      }
      return 'Usuario';  // Valor predeterminado en caso de que no haya un tipo definido
    }
}
