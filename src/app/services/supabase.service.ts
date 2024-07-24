import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private apiUrl = 'https://liimeyoinrftwakomrqs.supabase.co/rest/v1/users';
  private apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaW1leW9pbnJmdHdha29tcnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3NzIzNzAsImV4cCI6MjAzNzM0ODM3MH0.KGRZUVCHgmBJZcuMIa09wX7ABmk6FkvSzWmz2xY4in4'; // Reemplaza con tu clave de Supabase

  private httpOptions = {
    headers: new HttpHeaders({
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.supabase = createClient('https://liimeyoinrftwakomrqs.supabase.co', this.apiKey);
  }

  // Registrar usuario
  async registerUser(email: string, password: string, userType: string): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          email: email,
          password: password,
          user_type: userType
        })
      });
  
      if (!response.ok) {
        // Manejar el error de la respuesta
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }
  
      // Devolver la respuesta en caso de éxito
      return await response.json();
    } catch (error) {
      // Lanzar el error para que pueda ser manejado por el llamador
      throw error;
    }
  }

  // Iniciar sesión - consulta por correo electrónico y contraseña
  async signIn(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}?email=eq.${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }
  
      const users = await response.json();
  
      // Verificar si el usuario y la contraseña coinciden
      const user = users.find((user: any) => user.password === password); // Asegúrate de que la comparación sea segura
  
      return {
        session: user ? { user } : null,
        error: user ? null : new Error('Credenciales inválidas')
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar contraseña del usuario
  updatePassword(userId: string, newPassword: string): Observable<any> {
    const updateData = { password: newPassword };
    // Actualiza la contraseña del usuario por ID
    return this.http.patch<any>(`${this.apiUrl}?id=eq.${userId}`, updateData, this.httpOptions).pipe(
      catchError(this.handleError('updatePassword'))
    );
  }

  // Obtener el usuario actual
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) {
      throw new Error(error.message);
    }
    return user;
  }

  // Cerrar sesión
  async signOut(): Promise<any> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    return { error: null };
  }

  // Manejo de errores
  private handleError(operation = 'operation') {
    return (error: any): Observable<any> => {
      console.error(`${operation} failed: ${error.message}`);
      return of({ error: error.message });
    };
  }
}
