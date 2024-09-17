import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagoFallidoPage } from './pago-fallido.page';

const routes: Routes = [
  {
    path: '',
    component: PagoFallidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoFallidoPageRoutingModule {}
