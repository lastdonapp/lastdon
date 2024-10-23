import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate de ajustar la ruta según tu estructura
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.page.html',
  styleUrls: ['./admin-menu.page.scss'],
})
export class AdminMenuPage implements OnInit {
  usuarios: any[] | null = null;
  conductores: any[] | null = null;
  pedidos: any[] | null = null;
  

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController
  ) {}

  ngOnInit() {
    //this.checkAdminAccess();
    this.loadData();
  }

  //private async checkAdminAccess() {
  //  const userType = localStorage.getItem('userType');
  //  if (userType !== 'admin') {
  //    await this.router.navigate(['/login']);
  //  }
  //}

  private async loadData() {
    await Promise.all([
      this.getUsuarios(),
      this.getConductores(),
      this.getPedidos(),
    ]);
  }

  private async getPedidos() {
    try {
      const { data, error } = await this.supabaseService.getPedidosAdmin(); // Ajusta la llamada al método de Supabase
      if (error) throw error;
      this.pedidos = data;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      await this.showToast('Error al cargar los pedidos.');
    }
  }

  private async getConductores() {
    try {
      const { data, error } = await this.supabaseService.getConductores(); // Ajusta la llamada al método de Supabase
      if (error) throw error;
      this.conductores = data;
    } catch (error) {
      console.error('Error al obtener los conductores:', error);
      await this.showToast('Error al cargar los conductores.');
    }
  }

  private async getUsuarios() {
    try {
      const { data, error } = await this.supabaseService.getUsuarios(); // Ajusta la llamada al método de Supabase
      if (error) throw error;
      this.usuarios = data;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      await this.showToast('Error al cargar los usuarios.');
    }
  }

  private async activarDesactivarUsuario(usuarioId: string, estado: boolean) {
    try {
      const { data, error } = await this.supabaseService.updateUsuarioVerificado(usuarioId, estado); // Llamar al método en Supabase para actualizar el estado
      if (error) throw error;
      await this.showToast(estado ? 'Usuario activado exitosamente.' : 'Usuario desactivado exitosamente.');
      this.loadData(); // Recargar los datos después de la actualización
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      await this.showToast('Error al cambiar el estado del usuario.');
    }
  }

  async activarUsuario(usuarioId: string) {
    await this.activarDesactivarUsuario(usuarioId, true); // Activar usuario
  }

  async desactivarUsuario(usuarioId: string) {
    await this.activarDesactivarUsuario(usuarioId, false); // Desactivar usuario
  }
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

public sanitizeEmail(email: string): string {
  // Cortar el email antes del símbolo @
  return email.split('@')[0];
}

// Confirmar la eliminación de la cuenta, recibe el usuario a eliminar
async confirmDeleteAccount(userId: { id: string; email: string; user_type: string; created_at: string }) {
  const alert = await this.alertController.create({
    header: 'Confirmar eliminación',
    message: '¿Estás seguro de que deseas eliminar la cuenta de este usuario? Esta acción no se puede deshacer.',
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
          await this.secondConfirmation(userId);
        }
      }
    ]
  });

  await alert.present();
}

// Segunda confirmación
async secondConfirmation(userId: { id: string; email: string; user_type: string; created_at: string }) {
  const alert = await this.alertController.create({
    header: 'Última confirmación',
    message: '¿Estás absolutamente seguro de que deseas eliminar esta cuenta?',
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
          await this.deleteAccount(userId);
        }
      }
    ]
  });

  await alert.present();
}

// Eliminar la cuenta del usuario pasado como argumento
async deleteAccount(user: { id: string; email: string; user_type: string; created_at: string }) {
  try {
    // Save user data before deletion
    await this.saveUserDataBeforeDeletion(user);

    // Attempt to deactivate the account
    const { error } = await this.supabaseService.deleteAccountChofer(user.id, user.email);

    if (error && typeof error.message === 'string') {
      if (error.message.includes('No puedes eliminar la cuenta')) {
        alert('No puedes eliminar la cuenta hasta que todos los pedidos hayan sido entregados.');
      } else {
        console.error('Error al desactivar la cuenta:', error);
        alert('Hubo un error al eliminar la cuenta.');
      }
    } else {
      // Reload updated data after deletion
      this.loadData();
      alert('Cuenta eliminada correctamente.');
    }
  } catch (error) {
    console.error('Error inesperado durante la eliminación de la cuenta:', error);
    alert('Error inesperado al eliminar la cuenta.');
  }
}

// Guardar los datos antes de eliminar la cuenta
async saveUserDataBeforeDeletion(user: { email: string; user_type: string; created_at: string }) {
  const userData = {
    email: user.email,
    user_type: user.user_type,
    created_at: user.created_at,
  };
  
  // Guardar en la tabla 'usuarioseliminados'
  const { error } = await this.supabaseService.saveDeletedUserConductor(userData);

  if (error) {
    console.error('Error al guardar los datos antes de la eliminación:', error);
    alert('Error al guardar la información antes de eliminar la cuenta.');
  } else {
    console.log('Datos guardados correctamente en usuarios_eliminados.');
  }
}




}
