import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConductorMenuPage } from './conductor-menu.page';

const routes: Routes = [
  {
    path: '',
    component: ConductorMenuPage,
    children: [
      {
        path: 'mis-pedidos',
        loadChildren: () => import('./mis-pedidos/mis-pedidos.module').then(m => m.MisPedidosPageModule)
      },
      {
        path: 'agregar-pedidos',
        loadChildren: () => import('./agregar-pedidos/agregar-pedidos.module').then(m => m.AgregarPedidosPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConductorMenuPageRoutingModule {}
