import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { InicioPage } from './inicio/inicio.page';
import { demonGuard } from './guard/authguard';
import { MapPage } from './map/map.page';


const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'inicio', component: InicioPage },
  { path: 'inicio', component: InicioPage },

  { path: 'maps', component: MapPage }, // Agrega la ruta para la nueva página de mapa
  //{ path: '**', redirectTo: '/inicio' },  

  { 
    path: 'menu', 
    loadChildren: () => import('./menu/menu.module').then(m => m.MenuPageModule), 
    canActivate: [demonGuard] 
  },
  { 
    path: 'conductor-menu', 
    loadChildren: () => import('./conductor-menu/conductor-menu.module').then(m => m.ConductorMenuPageModule),
    canActivate: [demonGuard] 
  },
  { 
    path: 'admin-menu', 
    loadChildren: () => import('./admin-menu/admin-menu.module').then(m => m.AdminMenuPageModule),
    canActivate: [demonGuard] 
  },
  {
    path: 'pago-aprobado',
    loadChildren: () => import('./pago-aprobado/pago-aprobado.module').then( m => m.PagoAprobadoPageModule)
  },
  {
    path: 'pago-fallido',
    loadChildren: () => import('./pago-fallido/pago-fallido.module').then( m => m.PagoFallidoPageModule)
  },
  {
    path: 'pago-pendiente',
    loadChildren: () => import('./pago-pendiente/pago-pendiente.module').then( m => m.PagoPendientePageModule)
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
  },
  {
    path: 'register-google',
    loadChildren: () => import('./register-google/register-google.module').then( m => m.RegisterGooglePageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule)
  }

// Esta línea redirige cualquier ruta no definida al login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}