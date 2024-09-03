import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = "";
  password: string = "";
  confirmPassword: string = "";  // Nuevo campo
  userType: string = "";
  verificado: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private supabaseService: SupabaseService, 
    private router: Router,
    private toastController: ToastController
  ) {}

  async register() {
    if (!this.email || !this.password || !this.confirmPassword || !this.userType) {
      this.errorMessage = 'Todos los campos son requeridos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      // Registro de usuario en la tabla personalizada
      const response = await this.supabaseService.registerUser(this.email, this.password, this.userType, this.verificado);
      console.log('Usuario registrado:', response);

      if (response.success) {
        // Muestra un mensaje de éxito
        const toast = await this.toastController.create({
          message: 'Registro exitoso',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        
        // Redirige al login después de un registro exitoso
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Error en el registro';
        
        // Muestra un mensaje de error
        const toast = await this.toastController.create({
          message: 'Correo o contraseña incorrectos',
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    } catch (err) {
      console.error('Error en el registro:', err);
      this.errorMessage = (err as Error).message || 'Ocurrió un error inesperado';
      
      // Muestra un mensaje de error
      const toast = await this.toastController.create({
        message: this.errorMessage,
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async goBack(){
    this.router.navigate(['/login']);
  }
}