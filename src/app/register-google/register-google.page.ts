import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-google',
  templateUrl: './register-google.page.html',
  styleUrls: ['./register-google.page.scss'],
})
export class RegisterGooglePage {

  email: string = "";
  password: string = "";  // Contraseña generada para el usuario
  userType: string = "";
  verificado: boolean = false;
  errorMessage: string | null = null;
  user: any;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  // Método para iniciar sesión con Google
  async signIn() {
    try {
      const result = await this.authService.googleSignIn();

      if (result && result.email) {
        this.user = result;
        this.email = result.email;

        // Generar una contraseña aleatoria para almacenar en la base de datos
        this.password = this.generateRandomPassword();

        // Verificar si el usuario ya existe en la base de datos
        const userExists = await this.supabaseService.checkUserExists(this.email);
        if (userExists) {
          this.showToast('El usuario ya existe. Inicia sesión.', 'warning');
        } else {
          await this.registerUserWithGoogle();
        }
      } else {
        await this.showToast('Error en la autenticación con Google', 'danger');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      await this.showToast('Error en la autenticación con Google', 'danger');
    }
  }

  // Registrar el usuario en Supabase usando los datos de Google
  async registerUserWithGoogle() {
    try {
      const response = await this.supabaseService.registerGoogleUser(this.email, this.password, this.userType, this.verificado);

      if (response.success) {
        await this.showToast('Registro exitoso. Revisa tu correo para conocer tu contraseña.', 'success');
        this.router.navigate(['/login']);
      } else {
        await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
      }
    } catch (error) {
      console.error('Error al registrar usuario con Google:', error);
      await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
    }
  }

  // Método para generar una contraseña aleatoria
  generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Mostrar mensajes de alerta
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }
}
