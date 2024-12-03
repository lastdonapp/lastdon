import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth-service.service';


@Component({
  selector: 'app-register-google',
  templateUrl: './register-google.page.html',
  styleUrls: ['./register-google.page.scss'],
})
export class RegisterGooglePage {

  email: string = "";
  password: string = "";  // Contraseña generada para el usuario
  userType: string = "";
  verificado: boolean = false;
  errorMessage: string | null = null;
  user: any;

  constructor(
   
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController,
    private readonly authService: AuthService
  ) {}

  // Método para iniciar sesión con Google
async RegisterGoogle() {
  try {
    // Validar que el usuario haya seleccionado un tipo de cuenta
    if (!this.userType) {
      this.showToast('Por favor, selecciona un tipo de usuario antes de continuar.', 'warning');
      return;
    }

    const result = await this.authService.googleSignIn();

    if (result && result.email) {
      this.user = result;
      this.email = result.email;

      // Generar una contraseña aleatoria para almacenar en la base de datos
      this.password = this.generateRandomPassword();

      // Verificar si el usuario ya existe en la base de datos
      const userExists = await this.supabaseService.checkUserExists(this.email);
      if (userExists) {
        this.showToast('El usuario ya existe. Inicia sesión.', 'warning');
      } else {
        await this.registerUserWithGoogle();
      }
    } else {
      await this.showToast('Error en la autenticación con Google', 'danger');
    }
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    await this.showToast('Error en la autenticación con Google', 'danger');
  }
}

// Registrar el usuario en Supabase usando los datos de Google
async registerUserWithGoogle() {
  try {
    // Registrar al usuario en la base de datos con la contraseña hasheada
    const response = await this.supabaseService.registerGoogleUser(this.email, this.password, this.userType, this.verificado);

    if (response.success) {
      // Notificar al usuario que revise su correo para la contraseña
      await this.showToast('Registro exitoso. Revisa tu correo para conocer tu contraseña.', 'success');
      this.router.navigate(['/login']);
    } else {
      await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
    }
  } catch (error) {
    console.error('Error al registrar usuario con Google:', error);
    await this.showToast('Error en el registro. Intenta nuevamente.', 'danger');
  }
}


 // Método para generar una contraseña aleatoria
generateRandomPassword(length: number = 10): string {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '@#$%&*!'; // Puedes agregar más símbolos si lo deseas

  if (length < 8) {
    throw new Error('La longitud mínima de la contraseña debe ser 8 caracteres.');
  }

  // Asegurarse de que la contraseña contenga al menos un carácter de cada tipo
  let password = '';
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length)); // 1 letra mayúscula
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length)); // 1 letra minúscula
  password += numbers.charAt(Math.floor(Math.random() * numbers.length)); // 1 número
  password += symbols.charAt(Math.floor(Math.random() * symbols.length)); // 1 símbolo

  // Rellenar el resto de la contraseña
  const allChars = upperChars + lowerChars + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Barajar la contraseña para que los caracteres obligatorios no estén siempre al principio
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}


  // Mostrar mensajes de alerta
  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  goBack() {
    this.router.navigate(['/register']);
  }





}