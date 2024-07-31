import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarPedidosPageRoutingModule } from './agregar-pedidos-routing.module';

import { AgregarPedidosPage } from './agregar-pedidos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarPedidosPageRoutingModule
  ],
  declarations: [AgregarPedidosPage]
})
export class AgregarPedidosPageModule {}
