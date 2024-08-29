import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { demonGuard } from './guard/authguard';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { 
    path: 'menu', 
    loadChildren: () => import('./menu/menu.module').then(m => m.MenuPageModule), 
    canActivate: [demonGuard] 
  },
  { 
    path: 'conductor-menu', 
    loadChildren: () => import('./conductor-menu/conductor-menu.module').then(m => m.ConductorMenuPageModule),
    canActivate: [demonGuard] 
  },
  { 
    path: 'admin-menu', 
    loadChildren: () => import('./admin-menu/admin-menu.module').then(m => m.AdminMenuPageModule),
    canActivate: [demonGuard] 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}