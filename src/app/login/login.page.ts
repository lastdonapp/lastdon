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
      const { session, userType } = await this.supabaseService.signIn(this.email, this.password);

      if (session) {
        console.log('Access token:', session.tokens.token);
        console.log('Current refresh token from session:', session.tokens.refresh_token);

        if (this.email === 'benjabox1@gmail.com') {
          if (session.tokens.refresh_token) {
            // Actualizar el token con el refresh token
            const newTokens = await this.supabaseService.refreshToken(session.tokens.refresh_token);
            console.log('New access token:', newTokens.token);
            console.log('New refresh token:', newTokens.refresh_token);
          } else {
            console.error('No refresh token available in session');
          }
        }

        if (userType === 'normal') {
          this.router.navigate(['/menu']);
        } else if (userType === 'conductor') {
          this.router.navigate(['/conductor-menu']);
        }
      } else {
        console.error('Login failed:', session.error.message);
        this.errorMessage = 'Login failed: ' + session.error.message;
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'An error occurred during login.';
    }
  }
}
