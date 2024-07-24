import { Component } from '@angular/core';
import { SupabaseService } from '../services/supabase.service'; // Asegúrate de tener el servicio de Supabase configurado
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = "";
  password: string = "";
  confirmPassword: string = "";

  constructor(
    private supabaseService: SupabaseService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async register() {
    if (this.password !== this.confirmPassword) {
      this.showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      const { user, error } = await this.supabaseService.signUp(this.email, this.password);
      if (error) {
        this.showAlert('Error', 'No se pudo registrar el usuario');
      } else {
        this.showAlert('Éxito', 'Usuario registrado con éxito');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.showAlert('Error', 'Ocurrió un error al registrar el usuario');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
