import { Component } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate de tener el servicio de Supabase configurado
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage {
  currentPassword: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(
    private supabaseService: SupabaseService,
    private alertController: AlertController,
    private router: Router
  ) {}

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.showAlert('Error', 'Las nuevas contraseñas no coinciden');
      return;
    }

    try {
      const user = await this.supabaseService.getCurrentUser();
      if (!user || !user.email) {
        this.showAlert('Error', 'No se encontró usuario o correo electrónico');
        return;
      }

      const { error: signInError } = await this.supabaseService.signIn(user.email, this.currentPassword);
      if (signInError) {
        this.showAlert('Error', 'Contraseña actual incorrecta');
        return;
      }

      const { error: updateError } = await this.supabaseService.updatePassword(this.newPassword);
      if (updateError) {
        this.showAlert('Error', 'No se pudo cambiar la contraseña');
      } else {
        this.showAlert('Éxito', 'Contraseña cambiada con éxito');
      }
    } catch (error) {
      this.showAlert('Error', 'Ocurrió un error al cambiar la contraseña');
    }
  }

  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        this.showAlert('Error', 'No se pudo cerrar sesión');
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.showAlert('Error', 'Ocurrió un error al cerrar sesión');
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
