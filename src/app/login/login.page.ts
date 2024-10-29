import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController,AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string = "";
  password: string = "";
  verificado: boolean = false;
  errorMessage: string | null = null;
  
  user:any;

  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService, 
    private  readonly router: Router,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController
  ) {}



  ngOnInit() {
    // Limpiar los campos de email y password cuando se carga la página
    this.resetForm();
  }




  // Definir la función showToast
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }



  async login() {
    try {
      let session;
      let userType;
      let verificado;
  
      if (this.password) {
        // Si se proporciona una contraseña, intenta el inicio de sesión con email/contraseña
        ({ session, userType, verificado } = await this.supabaseService.signIn(this.email, this.password));
      } else {
        // Si no hay contraseña, probablemente sea un usuario de Google
        ({ session, userType, verificado } = await this.supabaseService.signIn(this.email, ''));
      }
  
      if (session) {
        localStorage.setItem('userType', userType);
        if (userType === 'normal') {
          if (!verificado) {
            await this.showPopup('Acceso denegado', 'Su cuenta está en proceso de validación. Por favor, contacte al soporte.');
            return;
          }
          await this.showToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/menu']);
        } else if (userType === 'conductor') {
          if (!verificado) {
            await this.showPopup('Acceso denegado', 'Su cuenta Conductor está en proceso de validación. Por favor, contacte al soporte.');
            return;
          }
          await this.showToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/conductor-menu']);
        } else if (userType === 'admin') {
          await this.showToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/admin-menu']);
        }

        this.resetForm();
      } else {
        await this.showToast('Correo o contraseña incorrectos', 'danger');
        console.log(session)
        console.log(userType)

      }
    } catch (error) {
      console.error('Login error:', error);
      await this.showToast('Ocurrió un error durante el inicio de sesión.', 'danger');
    }
  }
  
  private async showPopup(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
// Resetear el formulario
  resetForm() {
    this.email = '';
    this.password = '';
  }




}