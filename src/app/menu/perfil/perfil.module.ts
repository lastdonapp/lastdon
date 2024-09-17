import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPage } from './perfil.page';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';  // Importa el módulo compartido

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    SharedModule  // Usa el módulo compartido
  ],
  declarations: [PerfilPage]
})
export class PerfilPageModule {}
