import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session, AuthResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // Reemplaza con tus credenciales de Supabase
    this.supabase = createClient('https://liimeyoinrftwakomrqs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaW1leW9pbnJmdHdha29tcnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3NzIzNzAsImV4cCI6MjAzNzM0ODM3MH0.KGRZUVCHgmBJZcuMIa09wX7ABmk6FkvSzWmz2xY4in4');
  }

  // Obtener el usuario actual
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Iniciar sesión
  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, session: data.session, error };
  }

  // Registrar usuario
  async signUp(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    return { user: data.user, session: data.session, error };
  }

  // Actualizar la contraseña del usuario
  async updatePassword(newPassword: string): Promise<{ user: User | null; error: Error | null }> {
    const user = await this.getCurrentUser();
    if (user) {
      const { error } = await this.supabase.auth.updateUser({ password: newPassword });
      return { user, error };
    }
    throw new Error('No user logged in');
  }

  // Cerrar sesión
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }
}
