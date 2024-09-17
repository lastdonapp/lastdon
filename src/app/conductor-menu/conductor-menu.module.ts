import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ConductorMenuPageRoutingModule } from './conductor-menu-routing.module';
import { ConductorMenuPage } from './conductor-menu.page';
import { MisPedidosPageModule } from './mis-pedidos/mis-pedidos.module';
import { AgregarPedidosPageModule } from './agregar-pedidos/agregar-pedidos.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConductorMenuPageRoutingModule,
    MisPedidosPageModule,
    AgregarPedidosPageModule,
    SharedModule
  ],
  declarations: [ConductorMenuPage]
})
export class ConductorMenuPageModule {}
