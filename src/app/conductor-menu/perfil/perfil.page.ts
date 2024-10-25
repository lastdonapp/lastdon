import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { ChangePasswordModalComponent } from 'src/app/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  isDayMode: boolean = false; // Estado inicial
  userInfo: any;
  currentUser: any;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly modalController: ModalController
  ) {}

  async ngOnInit() {
    // Cargar la información del usuario logueado primero
    this.currentUser = this.getCurrentUser();

    try {
      const tokenData = await this.supabaseService.getToken();
      const accessToken = tokenData.token;
      this.userInfo = await this.supabaseService.getUserInfo(accessToken);
    } catch (error) {
      console.error('Error al cargar la información del usuario de Mercado Libre:', error);
    }

    const savedMode = localStorage.getItem('mode');
    if (savedMode) {
      this.isDayMode = savedMode === 'day';
      this.applyMode();
    }
  }

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  toggleMode() {
    this.isDayMode = !this.isDayMode;
    this.applyMode();
    // Guardar el modo en localStorage
    localStorage.setItem('mode', this.isDayMode ? 'day' : 'night');
  }

  applyMode() {
    if (this.isDayMode) {
      document.body.classList.add('day-mode');
      document.body.classList.remove('night-mode');
    } else {
      document.body.classList.add('night-mode');
      document.body.classList.remove('day-mode');
    }
  }

  async openChangePasswordModal() {
    const modal = await this.modalController.create({
      component: ChangePasswordModalComponent
    });
    return await modal.present();
  }

  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      localStorage.removeItem('userType');
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
