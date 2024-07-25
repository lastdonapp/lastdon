import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';  // Cambiado a ModalController
import { SupabaseService } from '../services/supabase.service'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent {
  currentPassword: string = "";
  newPassword: string = "";
  confirmPassword: string = "";

  constructor(
    private modalController: ModalController,  // Cambiado a ModalController
    private supabaseService: SupabaseService  // Asegúrate de inyectar el servicio
  ) {}

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      // Obtén el usuario desde el servicio o desde parámetros
      const user = await this.supabaseService.getCurrentUser();  // Ajusta según tu implementación
      if (user) {
        const userId = user.id;
        const response = await this.supabaseService.updatePassword(userId, this.newPassword).toPromise();
        
        if (response && response.error) {
          alert('Error al cambiar la contraseña');
        } else {
          alert('Contraseña cambiada con éxito');
          this.dismiss();  // Cierra el modal
        }
      } else {
        alert('Usuario no encontrado');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Error inesperado');
    }
  }

  dismiss() {
    this.modalController.dismiss();  // Cierra el modal usando ModalController
  }
}
