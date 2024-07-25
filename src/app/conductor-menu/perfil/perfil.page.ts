import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { ChangePasswordModalComponent } from 'src/app/change-password-modal/change-password-modal.component';// Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage {
  constructor(
    private supabaseService: SupabaseService, 
    private router: Router,
    private modalController: ModalController
  ) {}

  async openChangePasswordModal() {
    const modal = await this.modalController.create({
      component: ChangePasswordModalComponent
    });
    return await modal.present();
  }

  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        alert('Error al cerrar sesión');
      } else {
        this.router.navigate(['/login']);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado');
    }
  }
}
