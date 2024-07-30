import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError , switchMap} from 'rxjs/operators';
import { HashingService } from './hashing.service';



@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private apiUrl = 'https://liimeyoinrftwakomrqs.supabase.co/rest/v1/users';
  private tokensUrl = 'https://liimeyoinrftwakomrqs.supabase.co/rest/v1/tokens'; // URL para tokens
  private apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpaW1leW9pbnJmdHdha29tcnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3NzIzNzAsImV4cCI6MjAzNzM0ODM3MH0.KGRZUVCHgmBJZcuMIa09wX7ABmk6FkvSzWmz2xY4in4'; // Reemplaza con tu clave de Supabase
  private hashingService = new HashingService();


  private httpOptions = {
    headers: new HttpHeaders({
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // supabase.service.ts
  async getUserItems(accessToken: string): Promise<any> {
    try {
      const userInfo = await this.getUserInfo(accessToken);
      const userId = userInfo.id; // Suponiendo que el 'userId' es 'id'
      console.log("userinfo ", userInfo);
      console.log("id ", userId);
  
      const url = `/api/users/${userId}/items/search`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log("response: ", response)
      if (!response.ok) {
        throw new Error('Error al obtener los ítems del vendedor');
      }
      const data = await response.json();
      console.log("data: ", data)
      return data.results;
    } catch (error: any) {
      throw new Error('Error al obtener los ítems del vendedor: ' + (error.message || error));
    }
  }
  
  
  async getUserOrders(accessToken: string): Promise<any> {
    try {
      const userInfo = await this.getUserInfo(accessToken);
      const sellerId = userInfo.id; // Suponiendo que el 'seller_id' es 'id'
      console.log("userinfo ", userInfo);
      console.log("id ", sellerId);
  
      const url = `/api/orders/search?buyer=${sellerId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log("response: ", response)
      if (!response.ok) {
        throw new Error('Error al obtener los pedidos del comprador');
      }
      const data = await response.json();
      console.log("data: ", data)
      return data.results;
    } catch (error: any) {
      throw new Error('Error al obtener los pedidos del comprador: ' + (error.message || error));
    }
  }
  
  
  
  
  async getUserInfo(accessToken: string): Promise<any> {
    const url = `https://api.mercadolibre.com/users/me`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      throw new Error('Error al obtener la información del usuario');
    }
    const data = await response.json();
    return data;
  }
  
  
  // Registrar usuario
  async registerUser(email: string, password: string, userType: string): Promise<any> {
    try {
      const salt = crypto.randomUUID(); // Genera una sal usando una función disponible en la Web Crypto API
      const hashedPassword = await this.hashingService.hashPassword(password, salt); // Hashea la contraseña con la sal

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          email: email,
          password: hashedPassword,
          salt: salt, // También almacena la sal en la base de datos
          user_type: userType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error en el registro');
      }

      return { success: true };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Obtener el token desde la base de datos
async getToken(): Promise<any> {
  try {
    const response = await fetch(this.tokensUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al obtener el token:', errorData);
      throw new Error(errorData.message || 'Error al obtener el token');
    }

    const tokens = await response.json();
    console.log('Tokens from Supabase:', tokens); // Verificar qué se está recuperando
    return tokens[0]; // Suponiendo que solo hay una fila en la tabla
  } catch (error) {
    console.error('Error al obtener el token:', error);
    throw error;
  }
}


  // Guardar el token en la base de datos
  async saveToken(accessToken: string, refreshToken: string): Promise<any> {
    try {
      const response = await fetch(this.tokensUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          token: accessToken,
          'refresh_token': refreshToken // Columna con guion
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al guardar el token:', errorData);
        throw new Error(errorData.message || 'Error al guardar el token');
      }

      return { success: true };
    } catch (error) {
      console.error('Error al guardar el token:', error);
      throw error;
    }
  }

  // Actualizar el token
  async updateToken(accessToken: string, refreshToken: string): Promise<any> {
    const currentTime = new Date().toISOString(); // Obtener la fecha y hora actual en formato ISO
    try {
      const response = await fetch(this.tokensUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          token: accessToken,
          'refresh_token': refreshToken, // Columna con guion
          time: currentTime // Actualizar la columna 'time'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al actualizar el token:', errorData);
        throw new Error(errorData.message || 'Error al actualizar el token');
      }

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar el token:', error);
      throw error;
    }
  }

  // Renovar el token usando el refresh_token
  async refreshToken(refreshToken: string): Promise<{ access_token: string, refresh_token: string }> {
    try {
      // Log para verificar el valor del refreshToken recibido
      console.log('Received refreshToken:', refreshToken);
  
      if (!refreshToken) {
        throw new Error('Refresh token is undefined or null');
      }
  
      const url = 'https://api.mercadolibre.com/oauth/token';
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: '522125817708180',
        client_secret: 'DUGcxegFSocnuLhoyb41qbf2W3T6TnS3',
        refresh_token: refreshToken
      }).toString();
  
      // Log de la URL y del body que se enviará
      console.log('URL:', url);
      console.log('Body:', body);
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      });
  
      // Log del status de la respuesta
      console.log('Response status:', response.status);
  
      // Verifica si la respuesta es JSON
      let responseBody;
      try {
        responseBody = await response.json();
        console.log('Response body:', responseBody);
      } catch (jsonError) {
        // Si no es JSON, guarda el texto de la respuesta para depuración
        const responseText = await response.text();
        console.error('Response body (text):', responseText);
        throw new Error('Error al interpretar la respuesta de la API');
      }
  
      if (!response.ok) {
        // Si la respuesta no es OK, mostramos el cuerpo del error
        console.error('Error al renovar el token:', responseBody);
        throw new Error(responseBody.error || 'Error al renovar el token');
      }
  
      // Actualiza el token en la base de datos
      await this.updateTokenInTable(responseBody.access_token, responseBody.refresh_token);
  
      return {
        access_token: responseBody.access_token,
        refresh_token: responseBody.refresh_token
      };
    } catch (error) {
      console.error('Error al renovar el token:', error);
      throw error;
    }
  }
  

  // Obtener el usuario actual
  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    console.log('Current user from localStorage:', user);
    return user ? JSON.parse(user) : null;
  }

  // Cerrar sesión
  async signOut(): Promise<any> {
    try {
      localStorage.removeItem('currentUser');
      // Opcional: Eliminar el token de la base de datos si es necesario
      return { success: true };
    } catch (error) {
      console.error('Error inesperado durante el cierre de sesión:', error);
      throw new Error('Error inesperado durante el cierre de sesión');
    }
  }

  // Iniciar sesión - consulta por correo electrónico y contraseña
  public async signIn(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}?email=eq.${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error en el inicio de sesión');
      }
  
      const users = await response.json();
      const user = users[0]; // Asumimos que solo hay un usuario por email
  
      if (user && await this.hashingService.verifyPassword(password, user.salt, user.password)) { // Verifica la contraseña hasheada
        // Obtener el token desde la tabla de tokens
        const tokens = await this.getToken();
        console.log('Tokens from database:', tokens); // Verificar qué se está recuperando
  
        // Verifica si tokens es válido
        if (!tokens || !tokens['refresh_token']) {
          console.error('No refresh token found in database');
          throw new Error('Refresh token no encontrado en la base de datos');
        }
  
        localStorage.setItem('currentUser', JSON.stringify(user));
        return {
          session: { user, tokens },
          userType: user.user_type
        };
      } else {
        return {
          session: null,
          error: new Error('Credenciales inválidas')
        };
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }
  

  // Actualizar el token en la tabla
  async updateTokenInTable(accessToken: string, refreshToken: string): Promise<any> {
    try {
      // Obtén la hora actual en UTC
      const now = new Date();

      // Restar 4 horas a la hora actual
      now.setHours(now.getHours() - 4);
      // Extrae solo la hora de la fecha actual
      const time = now.toISOString().split('T')[1].split('.')[0]; // Formato HH:MM:SS
  
      const response = await fetch(`${this.tokensUrl}?id=eq.1`, { // Asegúrate de usar el ID correcto
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          token: accessToken,
          refresh_token: refreshToken,
          time: time // Actualizar la columna 'time' solo con la hora
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al actualizar el token en la tabla:', errorData);
        throw new Error(errorData.message || 'Error al actualizar el token en la tabla');
      }
  
      console.log('Token updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar el token en la tabla:', error);
      throw error;
    }
  }
  
  

  // Actualizar contraseña
  updatePassword(userId: string, newPassword: string, conPassword: string): Observable<any> {
    const user = this.getCurrentUser();

    if (!this.hashingService.verifyPassword(conPassword, user.salt, user.password)) {
      throw new Error('Current password does not match');
    }

    const salt = crypto.randomUUID(); // Genera un salt usando la Web Crypto API
    return from(this.hashingService.hashPassword(newPassword, salt)).pipe(
      switchMap(hashedPassword => {
        const updateData = {
          password: hashedPassword, // Contraseña hasheada
          salt: salt // Sal a actualizar
        };
        return this.http.patch<any>(`${this.apiUrl}?id=eq.${userId}`, updateData, this.httpOptions);
      }),
      catchError(this.handleError('updatePassword'))
    );
  }

  // Manejo de errores
  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<any> => {
      console.error(`${operation} failed: ${error.message}`);
      // Puedes personalizar el mensaje de error aquí si es necesario
      let errorMessage = 'Ocurrió un error desconocido.';
      if (error.error instanceof ErrorEvent) {
        // Errores del lado del cliente
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        // Errores del lado del servidor
        errorMessage = `Error del servidor: ${error.status} ${error.message}`;
      }
      return throwError(() => new Error(errorMessage));
    };
  }
}
