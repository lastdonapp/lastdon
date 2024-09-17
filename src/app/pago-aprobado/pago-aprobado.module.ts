import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagoAprobadoPageRoutingModule } from './pago-aprobado-routing.module';

import { PagoAprobadoPage } from './pago-aprobado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagoAprobadoPageRoutingModule
  ],
  declarations: [PagoAprobadoPage]
})
export class PagoAprobadoPageModule {}
