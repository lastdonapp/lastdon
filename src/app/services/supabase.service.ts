import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private apiUrl = 'https://liimeyoinrftwakomrqs.supabase.co/rest/v1/users';
  private apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaW1leW9pbnJmdHdha29tcnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3NzIzNzAsImV4cCI6MjAzNzM0ODM3MH0.KGRZUVCHgmBJZcuMIa09wX7ABmk6FkvSzWmz2xY4in4'; // Reemplaza con tu clave de Supabase

  private httpOptions = {
    headers: new HttpHeaders({
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

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
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error en el registro');
      }
  
      // Si el registro es exitoso, simplemente devuelve un objeto de éxito
      return { success: true };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }
  

  // Iniciar sesión - consulta por correo electrónico y contraseña
  async signIn(email: string, password: string): Promise<any> {
    try {
      const response = await fetch('https://liimeyoinrftwakomrqs.supabase.co/rest/v1/users?email=eq.' + encodeURIComponent(email), {
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
      const user = users.find((user: any) => user.password === password); // Asegúrate de que la comparación sea segura

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user)); // Guarda el usuario en el localStorage
        return {
          session: { user },
          userType: user.user_type // Devuelve el tipo de usuario
        };
      } else {
        return {
          session: null,
          error: new Error('Credenciales inválidas')
        };
      }
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
  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Cerrar sesión
  async signOut(): Promise<any> {
    try {
      localStorage.removeItem('currentUser');
      return { error: null };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('An unexpected error occurred during sign out');
      }
    }
  }

  // Manejo de errores
  private handleError(operation = 'operation') {
    return (error: any): Observable<any> => {
      console.error(`${operation} failed: ${error.message}`);
      return of({ error: error.message });
    };
  }
}
