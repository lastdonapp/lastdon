import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = "";
  password: string = "";
  userType: string = "";
  errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async register() {
    if (!this.email || !this.password || !this.userType) {
      this.errorMessage = 'Todos los campos son requeridos.';
      return;
    }

    try {
      // Registro de usuario en la tabla personalizada
      const response = await this.supabaseService.registerUser(this.email, this.password, this.userType);
      console.log('Usuario registrado:', response);

      if (response.success) {
        // Redirige al login después de un registro exitoso
        this.router.navigate(['/login']);
      } else {
        this.errorMessage = 'Error en el registro';
      }
    } catch (err) {
      console.error('Error en el registro:', err);
      this.errorMessage = (err as Error).message || 'Ocurrió un error inesperado';
    }
  }
}
