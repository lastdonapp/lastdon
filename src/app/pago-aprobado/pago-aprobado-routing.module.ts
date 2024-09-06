import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoAprobadoPage } from './pago-aprobado.page';

const routes: Routes = [
  {
    path: '',
    component: PagoAprobadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoAprobadoPageRoutingModule {}
