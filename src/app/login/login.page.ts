import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = "";
  password: string = "";
  errorMessage: string | null = null;

  constructor(
    private supabaseService: SupabaseService, 
    private router: Router,
    private toastController: ToastController
  ) {}

  async login() {
    try {
      const { session, userType } = await this.supabaseService.signIn(this.email, this.password);

      if (session) {
        console.log('Access token:', session.tokens.token);
        console.log('Current refresh token from session:', session.tokens.refresh_token);

        if (this.email === 'benjabox1@gmail.com') {
          if (session.tokens.refresh_token) {
            // Actualizar el token con el refresh token
            const newTokens = await this.supabaseService.refreshToken(session.tokens.refresh_token);
            console.log('New access token:', newTokens.token);
            console.log('New refresh token:', newTokens.refresh_token);
          } else {
            console.error('No refresh token available in session');
          }
        }

        if (userType === 'normal') {
          await this.showToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/menu']);
        } else if (userType === 'conductor') {
          await this.showToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/conductor-menu']);
        }
      } else {
        console.error('Login failed:', session.error.message);
        await this.showToast('Correo o contraseña incorrectos', 'danger');
      }
    } catch (error) {
      console.error('Login error:', error);
      await this.showToast('Ocurrió un error durante el inicio de sesión.', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }
}
