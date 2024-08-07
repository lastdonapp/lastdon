import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      {
        path: 'pedidos',
        loadChildren: () => import('./pedidos/pedidos.module').then(m => m.PedidosPageModule)
      },
      {
        path: 'agregar-pedidos',
        loadChildren: () => import('./agregar-pedidos/agregar-pedidos.module').then(m => m.AgregarPedidosPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('./perfil/perfil.module').then(m => m.PerfilPageModule)
      },
      {
        path: 'informacion',
        loadChildren: () => import('./informacion/informacion.module').then(m => m.InformacionPageModule)
      },
      {
        path: 'contacto',
        loadChildren: () => import('./contacto/contacto.module').then(m => m.ContactoPageModule)
      },
      {
        path: 'pagos',
        loadChildren: () => import('./pagos/pagos.module').then( m => m.PagosPageModule)
      },
      {
        path: 'historial',
        loadChildren: () => import('./historial/historial.module').then( m => m.HistorialPageModule)
      }
    ]
  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuPageRoutingModule { }
