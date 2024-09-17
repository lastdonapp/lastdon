import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoPendientePage } from './pago-pendiente.page';

const routes: Routes = [
  {
    path: '',
    component: PagoPendientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoPendientePageRoutingModule {}
