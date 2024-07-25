import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = "";
  password: string = "";
  errorMessage: string | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async login() {
    try {
      const { session, userType, error } = await this.supabaseService.signIn(this.email, this.password);
      
      if (session) {
        if (userType === 'conductor') {
          this.router.navigate(['/conductor-menu']);
        } else {
          this.router.navigate(['/menu']);
        }
      } else if (error) {
        this.errorMessage = error.message || 'Credenciales inválidas';
      }
    } catch (err) {
      console.error(err);
      this.errorMessage = (err as Error).message || 'Ocurrió un error inesperado';
    }
  }
  
}
