import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from '@ionic/angular';
import { SupabaseService } from './supabase.service';
import { environment } from 'src/environments/environment'; // Importa el archivo de entorno

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: any;

  constructor(
    private readonly platform: Platform,
    private readonly supabaseService: SupabaseService
  ) { 
    this.platform.ready().then(() => {
      GoogleAuth.initialize({
        clientId: environment.googleClientId,  // Aquí utiliza el Client ID de Google desde environment
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    });
  }

  async googleSignIn() {
    try {
      this.user = await GoogleAuth.signIn();
      return await this.user;
  
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }
}
