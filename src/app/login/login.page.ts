import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = "";
  password: string = "";
  userType: string = ""; // Solo usado para Google sign-in
  verificado: boolean = false;
  errorMessage: string | null = null;
  


  user:any;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService, 
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.resetForm();
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
          await this.showToast('Inicio de sesión exitoso', 'success');
          this.router.navigate(['/menu']);
        } else if (userType === 'conductor') {
          if (!verificado) {
            await this.showPopup('Acceso denegado', 'Su cuenta está en proceso de validación. Por favor, contacte al soporte.');
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

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  private resetForm() {
    this.email = '';
    this.password = '';
  }

}
