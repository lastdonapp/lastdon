import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PagoPendientePageRoutingModule } from './pago-pendiente-routing.module';

import { PagoPendientePage } from './pago-pendiente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PagoPendientePageRoutingModule
  ],
  declarations: [PagoPendientePage]
})
export class PagoPendientePageModule {}
