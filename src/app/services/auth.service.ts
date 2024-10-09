import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from '@ionic/angular';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment'; // Importa el archivo de entorno

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: any;

  constructor(
    private platform: Platform,
    private supabaseService: SupabaseService
  ) { 
    this.platform.ready().then(() => {
      GoogleAuth.initialize();
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
