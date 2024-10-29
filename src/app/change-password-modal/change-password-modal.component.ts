import { Component} from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent  {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;

  constructor(
    private readonly modalController: ModalController,
    private readonly supabaseService: SupabaseService,
    private readonly toastController: ToastController
  ) {}



  async changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const user = this.supabaseService.getCurrentUser();
    if (user) {
      try {
        const userId = user.id;
        const response = await this.supabaseService.updatePassword(userId, this.newPassword, this.currentPassword).toPromise();

        if (response && response.error) {
          throw new Error(response.error.message);
        }

        const toast = await this.toastController.create({
          message: 'Contraseña cambiada con éxito',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();

        this.modalController.dismiss({
          message: 'Contraseña cambiada con éxito'
        });
      } catch (err) {
        console.error(err);
        this.errorMessage = (err as Error).message || 'Error inesperado';

        const toast = await this.toastController.create({
          message: this.errorMessage,
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    } else {
      this.errorMessage = 'No se pudo obtener la información del usuario';
      
      const toast = await this.toastController.create({
        message: this.errorMessage,
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
