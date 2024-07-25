import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      { path: 'informacion', loadChildren: () => import('./informacion/informacion.module').then(m => m.InformacionPageModule) },
      { path: 'perfil', loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule) },
      { path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.module').then(m => m.PedidosPageModule) },
      { path: 'contacto', loadChildren: () => import('./contacto/contacto.module').then(m => m.ContactoPageModule) },
      { path: '', redirectTo: 'informacion', pathMatch: 'full' } // Default route
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuRoutingModule {}
