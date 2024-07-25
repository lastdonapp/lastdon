import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IonicModule
  ],
  declarations: [ChangePasswordModalComponent],
  exports: [ChangePasswordModalComponent]  // Exporta el componente
})
export class SharedModule {}
