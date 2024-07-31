import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarPedidosPage } from './agregar-pedidos.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarPedidosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarPedidosPageRoutingModule {}
