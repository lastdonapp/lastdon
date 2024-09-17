import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';  // Asegúrate de importar RouterModule

import { MenuPage } from './menu.page';
import { MenuPageRoutingModule } from './menu-routing.module';
import { PerfilPageModule } from './perfil/perfil.module';
import { PedidosPageModule } from './pedidos/pedidos.module';
import { InformacionPageModule } from './informacion/informacion.module';
import { ContactoPageModule } from './contacto/contacto.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,  // Asegúrate de que RouterModule esté aquí
    MenuPageRoutingModule,
    InformacionPageModule,
    PerfilPageModule,
    PedidosPageModule,
    ContactoPageModule
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
