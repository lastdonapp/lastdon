import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastController, AlertController, IonModal } from '@ionic/angular';
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

  @ViewChild('modal')
  modal!: IonModal;

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
      const { session, userType, verificado } = await this.supabaseService.signIn(this.email, this.password);

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
      }
    } catch (error) {
      console.error('Login error:', error);
      await this.showToast('Ocurrió un error durante el inicio de sesión.', 'danger');
    }
  }

  async signIn() {
    try {
      const result = await this.authService.googleSignIn();
      console.log(result);
      console.log(result.email);
      console.log(result.authentication);



      if (result.user) {
        this.user = result.user;
      } else {
        await this.showToast('Error en la autenticación con Google', 'danger');
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      await this.showToast('Error en la autenticación con Google', 'danger');
    }
  }

  async presentUserTypeSelection() {
    await this.modal.present();
  }

  async registerUserWithGoogle() {
    try {
      const response = await this.supabaseService.registerUser(this.user.email, this.user.password, this.userType, this.verificado);
      console.log('Usuario registrado con Google:', response);

      if (response.success) {
        localStorage.setItem('userType', this.userType);
        this.modal.dismiss();
        this.router.navigate(['/map']);
      } else {
        await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
      }
    } catch (error) {
      console.error('Error al registrar usuario con Google:', error);
      await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
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

  dismissModal() {
    this.modal.dismiss();
  }
}
