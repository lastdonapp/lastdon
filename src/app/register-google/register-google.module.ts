import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterGooglePageRoutingModule } from './register-google-routing.module';

import { RegisterGooglePage } from './register-google.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterGooglePageRoutingModule
  ],
  declarations: [RegisterGooglePage]
})
export class RegisterGooglePageModule {}
