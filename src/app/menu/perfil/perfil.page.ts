import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController,AlertController } from '@ionic/angular';
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
    private   supabaseService: SupabaseService,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController // Add AlertController

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



  // Función para confirmar la eliminación de la cuenta
  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Confirmar',
          handler: async () => {
            // Mostrar segunda confirmación
            await this.secondConfirmation();
          }
        }
      ]
    });

    await alert.present();
  }

  // Segunda confirmación
  async secondConfirmation() {
    const alert = await this.alertController.create({
      header: 'Última confirmación',
      message: '¿Estás absolutamente seguro de que deseas eliminar tu cuenta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar cuenta',
          handler: async () => {
            await this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  // Guardar los datos antes de eliminar la cuenta
  async saveUserDataBeforeDeletion(email: any) { // Add user parameter
    const userData = {
      email: email.email,
      user_type: email.user_type,
      created_at: email.created_at,
    };

    // Guardar en la tabla 'usuarioseliminados'
    const { error } = await this.supabaseService.saveDeletedUserData(userData);

    if (error) {
      console.error('Error al guardar los datos antes de la eliminación:', error);
      alert('Error al guardar la información antes de eliminar la cuenta.');
    } else {
      console.log('Datos guardados correctamente en usuarioseliminados.');
    }
  }

 // perfil.page.ts

async deleteAccount() {
  try {
      const user = this.getCurrentUser();
      if (!user) {
          alert('Usuario no encontrado.');
          return;
      }
      // Verificar si el user.id es un número entero válido
      const userId = parseInt(user.id, 10);
      if (isNaN(userId)) {
          alert('ID de usuario inválido.');
          return;
      }


      // Intentar desactivar la cuenta
      const { error } = await this.supabaseService.deletAccount(user.id, user.email);
      if (error) {
          // Verificar si el error es debido a pedidos pendientes de entrega
          if (error.message.includes('No puedes eliminar la cuenta')) {
              alert('No puedes eliminar la cuenta hasta que todos tus pedidos hayan sido entregados.');
          } else {
              console.error('Error al desactivar la cuenta:', error);
              alert('Hubo un error al eliminar la cuenta.');
          }
      } else {
          // Guardar los datos antes de la eliminación
          await this.saveUserDataBeforeDeletion(user);
      
          // Si la eliminación es exitosa
          localStorage.clear(); // Limpiar datos locales
          this.router.navigate(['/login']);
          alert('Cuenta eliminada correctamente.');
      }
  } catch (error) {
      console.error('Error durante la eliminación de la cuenta:', error);
      alert('Error inesperado al eliminar la cuenta.');
  }
}

  
}  
