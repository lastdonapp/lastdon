import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';

@NgModule({
  declarations: [ChangePasswordModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [ChangePasswordModalComponent] // Exporta si es necesario en otros módulos
})
export class SharedModule {}
