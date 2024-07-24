import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      // Define child routes here
      { path: 'perfil', loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule) },
      { path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.module').then(m => m.PedidosPageModule) },
      { path: 'informacion', loadChildren: () => import('./informacion/informacion.module').then(m => m.InformacionPageModule) },
      { path: 'contacto', loadChildren: () => import('./contacto/contacto.module').then(m => m.ContactoPageModule) },
      { path: '', redirectTo: 'perfil', pathMatch: 'full' } // Default route
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuRoutingModule {}
