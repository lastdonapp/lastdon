import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent implements OnInit {
  currentPassword: string = ''; // Añadido
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;

  constructor(
    private modalController: ModalController,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {}

  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const user = this.supabaseService.getCurrentUser();
    if (user) {
      try {
        const userId = user.id;
        const response = await this.supabaseService.updatePassword(userId, this.newPassword).toPromise();
        
        if (response.error) {
          throw new Error(response.error.message);
        }

        // Cierra el modal y muestra un mensaje de éxito
        this.modalController.dismiss({
          message: 'Contraseña cambiada con éxito'
        });
      } catch (err) {
        console.error(err);
        this.errorMessage = (err as Error).message || 'Error inesperado';
      }
    } else {
      this.errorMessage = 'No se pudo obtener la información del usuario';
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
