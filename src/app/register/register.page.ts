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
      // Muestra un mensaje de éxito
      const toast = await this.toastController.create({
        message: 'Todos los campos son requeridos.',
        duration: 5000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  
    if (!this.validateEmailFormat(this.email)) {
        // Muestra un mensaje de éxito
        const toast = await this.toastController.create({
          message: 'Formato de correo electrónico inválido.',
          duration: 5000,
          position: 'top',
          color: 'warning'
        });
        await toast.present();
    }

    if (this.password !== this.confirmPassword) {
        // Muestra un mensaje de éxito
        const toast = await this.toastController.create({
          message: 'Las contraseñas no coinciden.',
          duration: 5000,
          position: 'top',
          color: 'warning'
        });
        await toast.present();
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
      
    }
  }

  async goBack(){
    this.router.navigate(['/inicio']);
  }



  private validateEmailFormat(email: string): boolean {
    // Expresión regular para validar correos electrónicos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
}
