import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage {
  currentPassword: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(private supabaseService: SupabaseService) {}

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const user = await this.supabaseService.getCurrentUser();
      if (user) {
        const userId = user.id;
        const response = await this.supabaseService.updatePassword(userId, this.newPassword).toPromise();
        if (response.error) {
          alert('Error al cambiar la contraseña');
        } else {
          alert('Contraseña cambiada con éxito');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado');
    }
  }

  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        alert('Error al cerrar sesión');
      } else {
        // Redirige al login o realiza otras acciones necesarias
        console.log('Sesión cerrada');
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado');
    }
  }
}
