import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError , switchMap} from 'rxjs/operators';
import { HashingService } from './hashing.service';
import { environment } from 'src/environments/environment.prod';
import { createClient } from '@supabase/supabase-js';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';




@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private tokensUrl = environment.tokensUrl; // URL para tokens
  private apiUrl = environment.apiUrl; // Usa la URL de la API del entorno
  private apiKey = environment.apiKey; // Usa la API Key del entorno
  private pedidos = environment.pedUrl;
  private URL = environment.URL; // url base
  private hashingService = new HashingService();
  private supabase = createClient(this.URL, this.apiKey);


  private httpOptions = {
    headers: new HttpHeaders({
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  async takePicture(): Promise<File> {
    const image = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    const response = await fetch(image.webPath!);
    const blob = await response.blob();

    // Convertir el Blob a File
    const file = new File([blob], `photo-${new Date().getTime()}.jpeg`, { type: 'image/jpeg' });

    return file;
  }

  async uploadImage(file: File, path: string) {
    const { data, error } = await this.supabase.storage.from('imagenes').upload(path, file);
    return { data, error };
  }

  async getImageUrl(path: string): Promise<{ publicURL: string | null; error: string | null }> {
    const { data } = this.supabase.storage.from('imagenes').getPublicUrl(path);
    if (!data.publicUrl) {
      return { publicURL: null, error: 'No public URL found' };
    }
    return { publicURL: data.publicUrl, error: null };
  }


  async saveImageUrlToTable(imageUrl: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .insert([{ image_url: imageUrl }]);

    if (error) {
      throw error;
    }

    return data;
  }


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
  
  async addPedido(pedido: any): Promise<any> {
    try {
      const response = await fetch(`${this.pedidos}`, { // Ajusta la URL si es necesario
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey, // API Key para autorización
          'Authorization': `Bearer ${this.apiKey}` // Autorización con Bearer Token
        },
        body: JSON.stringify({
          nombre_pedido: pedido.nombrePedido,
          descripcion_pedido: pedido.descripcionPedido,
          direccion_pedido: pedido.direccionPedido,
          direccion_entrega: pedido.direccionEntrega,
          nombre_destinatario: pedido.nombreDestinatario,
          numeracion_casa: pedido.numeracionCasa,
          vivienda: pedido.vivienda,
          comuna: pedido.comuna,
          telefono: pedido.telefono,
          cantidad_paquetes: pedido.cantidadPaquetes,
          dimensiones: pedido.dimensiones,
          fragil: pedido.fragil,
          cambio: pedido.cambio,
          excede_10_kilos: pedido.excede10Kilos,
          fecha: pedido.fecha,
          costo: pedido.costo,
          estado: pedido.estado,
          fecha_tomado: pedido.fechaTomado,
          conductor: pedido.conductor,
          usuario: pedido.usuario,
          codigo: pedido.codigo,
          image_url: pedido.image_url
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Obtener el texto de error
        console.error('Error en la respuesta del servidor:', errorText);
        throw new Error(errorText || 'Error al agregar pedido');
      }
  
      
  
      return { data: null, error: null }; // No se espera respuesta útil, devolver null
    } catch (error) {
      console.error('Error al agregar pedido:', error);
      return { data: null, error };
    }
  }
  //traer pedidos
  async getPedidos(usuario: string): Promise<any> {
    try {
      const response = await fetch(`${this.pedidos}?usuario=eq.${encodeURIComponent(usuario)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al obtener los pedidos:', errorData);
        throw new Error(errorData.message || 'Error al obtener el token');
      }
  
      const pedidos = await response.json();
      console.log('pedidos Supabase:', pedidos); 
      return pedidos; 
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      throw error;
    }
  }

  async getPedidoById(id: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }
  
  async getPedidosPorTomar(): Promise<any> {
    try {
      const response = await fetch(`${this.pedidos}?estado=eq.por tomar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al obtener los pedidos:', errorData);
        throw new Error(errorData.message || 'Error al obtener los pedidos');
      }
  
      const pedidos = await response.json();
      console.log('Pedidos por tomar:', pedidos);
      return pedidos;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      throw error;
    }
  }

  // supabase.service.ts
  async tomarPedido(pedidoId: string, conductor: string): Promise<any> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado: 'tomado',
          conductor: conductor,
          fecha_tomado: new Date().toISOString() // Fecha actual en formato ISO
        })
      });
  
      // Verificar si la respuesta no es un JSON
      if (!response.ok) {
        const errorText = await response.text(); // Obtener el texto de error
        console.error('Error al actualizar el pedido:', errorText);
        throw new Error(errorText || 'Error al actualizar el pedido');
      }
  
      // Intentar analizar la respuesta JSON solo si el cuerpo no está vacío
      const responseText = await response.text();
      if (responseText.trim() === '') {
        // Respuesta vacía, podemos asumir que la actualización fue exitosa
        console.log('Pedido actualizado con éxito, pero sin respuesta JSON');
        return { success: true };
      }
  
      const updatedPedido = JSON.parse(responseText);
      console.log('Pedido actualizado:', updatedPedido);
      return updatedPedido;
  
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      throw error;
    }
  }
  async getPedidosPorConductor(email: string, estado: string): Promise<any[]> {
    try {
      const query = estado ? `?conductor=eq.${encodeURIComponent(email)}&estado=eq.${encodeURIComponent(estado)}` : `?conductor=eq.${encodeURIComponent(email)}`;
      const response = await fetch(`${this.pedidos}${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al obtener los pedidos:', errorText);
        throw new Error(errorText || 'Error al obtener los pedidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      throw error;
    }
  }

  async entregarPedido(pedidoId: string): Promise<void> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado: 'entregado'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al actualizar el pedido:', errorText);
        throw new Error(errorText || 'Error al actualizar el pedido');
      }
    } catch (error) {
      console.error('Error al entregar el pedido:', error);
      throw error;
    }
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
