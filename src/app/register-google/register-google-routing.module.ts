import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterGooglePage } from './register-google.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterGooglePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterGooglePageRoutingModule {}
