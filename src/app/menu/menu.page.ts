import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  currentUser: any ={};
  currentTitle: string = 'Bienvenido';  // Título por defecto
  constructor(private readonly router: Router) { }

  ngOnInit() {
    // Cargar la información del usuario logueado primero
    this.currentUser = this.getCurrentUser();

    // Redirigir a la página de información por defecto
    this.router.navigate(['/menu/informacion']);
    
    // Validar tipo de usuario
    const userStorage = localStorage.getItem('userType');
    if (userStorage !== 'normal') {
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
      case '/menu/pedidos':
        this.currentTitle = 'Pedidos';
        break;
      case '/menu/agregar-pedidos':
        this.currentTitle = 'Agregar Pedido';
        break;
      case '/menu/perfil':
        this.currentTitle = 'Perfil';
        break;
      case '/menu/informacion':
        this.currentTitle = 'Información';
        break;
      case '/menu/contacto':
        this.currentTitle = 'Contacto';
        break;
      case '/menu/pagos':
        this.currentTitle = 'Pagos';
        break;
      case '/menu/historial':
        this.currentTitle = 'Historial';
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
