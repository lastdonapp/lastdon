import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError , switchMap} from 'rxjs/operators';
import { HashingService } from './hashing.service';
import { environment } from 'src/environments/environment.prod';
import { createClient } from '@supabase/supabase-js';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import emailjs from '@emailjs/browser';




@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly tokensUrl = environment.tokensUrl; // URL para tokens
  private  readonly apiUrl = environment.apiUrl; // Usa la URL de la API del entorno
  private readonly apiKey = environment.apiKey; // Usa la API Key del entorno
  private readonly pedidos = environment.pedUrl;
  private readonly URL = environment.URL; // url base
  private  readonly tracking = environment.trackUrl;
  private readonly hashingService = new HashingService();
  private readonly supabase = createClient(this.URL, this.apiKey);


  private  readonly httpOptions = {
    headers: new HttpHeaders({
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) {}

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
  
  
// Función para validar el formato del correo electrónico
private validateEmailFormat(email: string): boolean {
  // Expresión regular para validar correos electrónicos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar el formato de la contraseña
private validatePassword(password: string): boolean {
  // Expresión regular para validar contraseñas
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_])(?=.{8,})/;
  return passwordRegex.test(password);
}

// Registrar usuario
async registerUser(email: string, password: string, userType: string, verificado: boolean): Promise<any> {
  try {
    // Validar formato del correo electrónico
    if (!this.validateEmailFormat(email)) {
      throw new Error('Formato de correo electrónico inválido');
    }

    // Validar formato de la contraseña
    if (!this.validatePassword(password)) {
      throw new Error('La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un carácter especial');
    }

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
        user_type: userType,
        verificado: verificado
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




//Google


async checkUserExists(email: string): Promise<boolean> {
  const { data, error } = await this.supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (error && error.code === 'PGRST116') {
    return false; // El usuario no existe
  }

  if (data) {
    return true; // El usuario ya está registrado
  }

  throw new Error('Error al verificar el usuario');
} 

async registerGoogleUser(email: string, password: string, userType: string, verificado: boolean): Promise<any> {
  const userExists = await this.checkUserExists(email);
  if (userExists) {
    throw new Error('El usuario ya está registrado');
  }

  // Generar una sal única
  const salt = crypto.randomUUID(); // Genera una sal usando la Web Crypto API

  // Hashear la contraseña antes de almacenarla
  const hashedPassword = await this.hashingService.hashPassword(password, salt);

  // Insertar el usuario en la base de datos
  const { data, error } = await this.supabase
    .from('users')
    .insert([
      { email: email, password: hashedPassword, user_type: userType, verificado: verificado, salt: salt }
    ]);

  if (error) {
    throw new Error('Error al registrar usuario: ' + error.message);
  }

  // Enviar la contraseña sin hashing al correo del usuario
  await this.sendEmail(email, password);

  return { success: true, data };
}


// Método para enviar el correo usando EmailJS
async sendEmail(email: string, password: string): Promise<void> {
  const templateParams = {
    to_name: email,
    password: password,
  };

  try {
    const response = await emailjs.send('service_z9qtwmo', 'template_9i5xk9a', templateParams, 'myh6jilHRl1Qg8DMJ');
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Aquí puedes hacer un manejo adicional del error
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

  public async signIn(email: string, password?: string): Promise<any> {
    try {
      // Consulta por correo electrónico
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
  
      if (!user) {
        throw new Error('El usuario no existe');
      }
  
      // Verificar si el usuario está registrado con Google
      if (user.google_registered) {
        // Iniciar sesión con Google (OAuth)
        const { data, error } = await this.supabase.auth.signInWithOAuth({
          provider: 'google',
        });
  
        if (error) {
          console.error('Error al iniciar sesión con Google:', error);
          throw error;
        }
  
        // Guardar el usuario en el almacenamiento local (si es necesario)
        localStorage.setItem('currentUser', JSON.stringify(user));
  
        return {
          session: { user, tokens: data },  // Devuelve los tokens obtenidos del OAuth de Google
          userType: user.user_type,
          verificado: user.verificado
        };
  
      } else {
        // Validación con email y contraseña
        if (!password) {
          throw new Error('La contraseña es obligatoria');
        }
  
        // Verificar la contraseña
        const passwordIsValid = await this.hashingService.verifyPassword(password, user.salt, user.password);
        if (!passwordIsValid) {
          throw new Error('Credenciales inválidas');
        }
  
        // Guardar el usuario en el almacenamiento local (si es necesario)
        localStorage.setItem('currentUser', JSON.stringify(user));
  
        return {
          session: { user },
          userType: user.user_type,
          verificado: user.verificado
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
    // Redondear el costo a un número entero
    const roundedCosto = Math.round(pedido.costoTotal);
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
          excede_Kilos: pedido.excedeKilos,
          fecha: pedido.fecha,
          costo: roundedCosto,
          estado: pedido.estado,
          fecha_tomado: pedido.fechaTomado,
          conductor: pedido.conductor,
          usuario: pedido.usuario,
          codigo: pedido.codigo,
          image_url: pedido.image_url,
          pagado: pedido.pagado
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

  async pagarPedido(pedidoId: string): Promise<any> {
  try {
    const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        pagado: true // Solo actualizamos el estado pagado
      })
    });

    // Depuración: verificar la respuesta del servidor
    const responseData = await response.json();
    console.log('Respuesta del servidor:', responseData);

    if (!response.ok) {
      console.error('Error en la respuesta de Supabase:', responseData);
      throw new Error('Error en la actualización de Supabase');
    }

    return responseData;

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

  async getPedidosPorUsuario(email: string, estado: string): Promise<any[]> {
    try {
      const query = estado ? `?usuario=eq.${encodeURIComponent(email)}&estado=eq.${encodeURIComponent(estado)}` : `?usuario=eq.${encodeURIComponent(email)}`;
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
  async getPedidosPorUsuarioPorpagar(email: string, estado: string): Promise<any[]> {
    try {
      let query = `?usuario=eq.${encodeURIComponent(email)}&pagado=eq.false`;
      if (estado) {
        query += `&estado=eq.${encodeURIComponent(estado)}`;
      }
  
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
      // Actualizar el estado del pedido a 'entregado'
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado: 'entregado',
          fecha_entrega: new Date().toISOString()
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al actualizar el pedido:', errorText);
        throw new Error(errorText || 'Error al actualizar el pedido');
      }
  
      // Actualizar el estado del tracking a 'finalizado'
      const trackingResponse = await fetch(`${this.tracking}?pedido_id=eq.${encodeURIComponent(pedidoId)}`, { // Cambiado a pedido_id
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado_tracking: 'finalizado', // Se usa estado_tracking, ya que es la columna correcta
          timestamp: new Date().toISOString() // Actualiza el timestamp de finalización
        })
      });
  
      if (!trackingResponse.ok) {
        const trackingErrorText = await trackingResponse.text();
        console.error('Error al actualizar el tracking:', trackingErrorText);
        throw new Error(trackingErrorText || 'Error al actualizar el tracking');
      }
  
    } catch (error) {
      console.error('Error al entregar el pedido:', error);
      throw error;
    }
  }



  async recepcionarPedido(pedidoId: string): Promise<void> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado: 'recepcionado'
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




  async almacenarPedido(pedidoId: string): Promise<void> {
    try {
        // Actualizar el estado del pedido a 'En centro de Distribución'
        const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                estado: 'En centro de Distribución'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al actualizar el pedido:', errorText);
            throw new Error(errorText || 'Error al actualizar el pedido');
        }

        // Actualizar el estado del tracking a 'En pausa'
        const trackingResponse = await fetch(`${this.tracking}?pedido_id=eq.${encodeURIComponent(pedidoId)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                estado_tracking: 'En pausa',  // Se actualiza el estado del tracking
                timestamp: new Date().toISOString() // Actualiza el timestamp
            })
        });

        if (!trackingResponse.ok) {
            const trackingErrorText = await trackingResponse.text();
            console.error('Error al actualizar el tracking:', trackingErrorText);
            throw new Error(trackingErrorText || 'Error al actualizar el tracking');
        }

        console.log('Pedido y tracking actualizados exitosamente.');

    } catch (error) {
        console.error('Error al almacenar el pedido:', error);
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


  async iniciarTracking(trackingData: any): Promise<string> {
    const { data, error } = await this.supabase
      .from('tracking')
      .insert(trackingData)
      .select('id')  // Recupera el ID del nuevo registro insertado
      .single();     // Asegúrate de obtener solo un registro
    
    if (error) {
      console.error('Error al iniciar el tracking en Supabase:', error);
      throw error;   // Lanza el error para manejarlo en otro lugar
    }
  
    console.log('Tracking iniciado con éxito:', data);
    return data.id;  // Retorna el ID del nuevo registro de tracking
  }
  


  async obtenerEstadoPedido(pedidoId: string): Promise<string> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al obtener el estado del pedido:', errorText);
        throw new Error(errorText || 'Error al obtener el estado del pedido');
      }
  
      const [pedido] = await response.json();
      return pedido.estado;
    } catch (error) {
      console.error('Error al obtener el estado del pedido:', error);
      throw error;
    }
  }



  async getTrackingByPedidoId(pedidoId: string): Promise<{ data: any[], error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('tracking')
        .select('estado_tracking')
        .eq('pedido_id', pedidoId)
        .order('timestamp', { ascending: false })  // Asegura que obtengas el estado más reciente
        .limit(1); // Solo necesitas el estado más reciente
  
      if (error) {
        throw error;
      }
  
      return { data, error };
    } catch (error) {
      console.error('Error al obtener el estado del tracking:', error);
      return { data: [], error };
    }
  }



  async updateTrackingLocation(trackingId: string, latitud: number, longitud: number): Promise<void> {
    try {
      console.log(`Actualizando tracking con ID: ${trackingId}, Latitud: ${latitud}, Longitud: ${longitud}`);
      
      const { data, error } = await this.supabase
        .from('tracking')
        .update({ 
          latitud, 
          longitud, 
          timestamp: new Date()  // Actualiza el timestamp
        })
        .eq('id', trackingId);
    
      if (error) {
        console.error('Error al actualizar la ubicación del tracking:', error);
        throw error;  // Lanza el error para que pueda ser manejado por el llamador
      }
    
      console.log('Ubicación del tracking actualizada con éxito:', data);
    } catch (error) {
      console.error('Ocurrió un error al intentar actualizar la ubicación del tracking:', error);
      // Aquí puedes manejar el error de manera adicional si es necesario
      throw error;  // Vuelve a lanzar el error para que pueda ser manejado en otro lugar
    }
  }
  


  async getTracking(pedidoId: string) {
    const { data, error } = await this.supabase
      .from('tracking')
      .select('*')
      .eq('pedido_id', pedidoId);
  
    if (error) {
      throw error;
    }
  
    return data;
  }



  async obtenerDetallesPedido(pedidoId: string): Promise<any> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al obtener los detalles del pedido:', errorText);
        throw new Error(errorText || 'Error al obtener los detalles del pedido');
      }
  
      const [pedido] = await response.json();
      return {
        conductor: pedido.conductor, // Asegúrate de que estos campos existen en tu tabla
        usuario: pedido.usuario,
        estado: pedido.estado,

      };
    } catch (error) {
      console.error('Error al obtener los detalles del pedido:', error);
      throw error;
    }
  }




  async verificarTrackingIniciado(pedidoId: string): Promise<boolean> {
    try {
        // Actualizamos la URL para buscar tanto "iniciado" como "reanudado"
        const response = await fetch(`${this.tracking}?pedido_id=eq.${encodeURIComponent(pedidoId)}&estado_tracking=in.(iniciado,reanudado)`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al verificar el tracking:', errorText);
            throw new Error(errorText || 'Error al verificar el tracking');
        }

        const trackingData = await response.json();

        // Retorna verdadero si hay al menos un tracking con estado 'iniciado' o 'reanudado'
        return trackingData.length > 0;
    } catch (error) {
        console.error('Error al verificar el tracking:', error);
        throw error;
    }
}



async liberarConductor(pedidoId: string): Promise<void> {
  try {
    const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        conductor: ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al desligar conductor:', errorText);
      throw new Error(errorText || 'Error al actualizar el pedido');
    }
  } catch (error) {
    console.error('Error al desligar conductor:', error);
    throw error;
  }
}




async liberarTrackingConductor(trackingId: string): Promise<void> {
  try {
    // Realizar el PATCH utilizando el trackingId como referencia
    const response = await fetch(`${this.tracking}?id=eq.${trackingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        conductor_email: ''  // Vaciar el campo del conductor
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al liberar conductor de tracking:', errorText);
      throw new Error(errorText || 'Error al actualizar tracking');
    }

    console.log('Conductor liberado correctamente del tracking');

  } catch (error) {
    console.error('Error al liberar conductor de tracking:', error);
    throw error;
  }
}











async getTrackingById(pedidoId: string): Promise<string | null> {
  try {
      const { data, error } = await this.supabase
          .from('tracking')
          .select('id')
          .eq('pedido_id', pedidoId)
          .single();  // Suponiendo que hay solo un tracking por pedido

      if (error) {
          console.error('Error al obtener el trackingId:', error);
          return null;
      }

      return data ? data.id : null;
  } catch (error) {
      console.error('Error en getTrackingById:', error);
      return null;
  }
}




async getPedidosReanudar(): Promise<any> {
  try {
    const response = await fetch(`${this.pedidos}?estado=eq.En centro de Distribución`, {
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
    console.log('Pedidos por reanudar:', pedidos);
    return pedidos;
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    throw error;
  }
}


  async tomarPedidoIngresado(pedidoId: string, conductor: string): Promise<any> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado: 'reanudado',
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


  async nuevoConductorTracking(trackingId: string, conductor_email: string): Promise<void> {
    try {
      const response = await fetch(`${this.tracking}?id=eq.${encodeURIComponent(trackingId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          conductor_email: conductor_email
        })
      });
  
      if (response.ok) {
        console.log('Conductor anexado correctamente.');
      } else {
        throw new Error(`Error al actualizar el conductor: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al anexar conductor en la tabla tracking:', error);
    }
  }
  

  async reanudarTracking(trackingId: string): Promise<void> {
    try {
      const response = await fetch(`${this.tracking}?id=eq.${encodeURIComponent(trackingId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          estado_tracking: 'reanudado'
        })
      });
  
      if (response.ok) {
        console.log('Estado del tracking actualizado a "reanudado".');
      } else {
        throw new Error(`Error al reanudar el tracking: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al reanudar el tracking:', error);
    }
  }


  async registroPrimerConductor(pedidoId: string, conductor_email: string): Promise<void> {
    try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          primer_conductor: conductor_email
        })
      });
  
      if (response.ok) {
        console.log('Conductor registrado correctamente.');
      } else {
        throw new Error(`Error al actualizar el conductor: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al registrar conductor en la tabla de pedidos:', error);
    }
  }




    // Método para actualizar la foto de entrega
    async updatePedidoFotoEnvio(pedidoId: string, fotoUrl: string) {
      const { data, error } = await this.supabase
        .from('pedidos') // Tabla de pedidos
        .update({ fotoEnvio_final: fotoUrl }) // Actualizar la URL de la foto
        .eq('id', pedidoId); // Filtrar por el ID del pedido
  
      return { data, error };
    }






  async envioRapido(pedidoId: string): Promise<void> {
    try {
        // Actualizar el estado del pedido a 'Reubicación en curso'
        const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey,
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                estado: 'Envio rápido' // Actualiza el estado del pedido
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al actualizar el estado del pedido:', errorText);
            throw new Error(errorText || 'Error al actualizar el estado del pedido');
        }

        console.log('Estado del pedido actualizado exitosamente a "Envío rápido.');

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        throw error;
    }
}



async obtenerDetallesPedidoEntregado(pedidoId: string): Promise<any> {
  try {
    const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener los detalles del pedido:', errorText);
      throw new Error(errorText || 'Error al obtener los detalles del pedido');
    }

    const [pedido] = await response.json();

    return {
      nombre_pedido: pedido.nombre_pedido, // Asegúrate de usar el nombre correcto
      comuna: pedido.comuna,
      image_url: pedido.image_url,
      usuario: pedido.usuario,
      excede_Kilos: pedido.excede_Kilos, // Verifica también el nombre correcto aquí
      fragil: pedido.fragil,
      dimensiones: pedido.dimensiones,
      cambio : pedido.cambio
    };
  } catch (error) {
    console.error('Error al obtener los detalles del pedido:', error);
    throw error;
  }
}





async actualizarCambioRealizado(pedidoId: string, cambioRealizado: boolean) {
  const {  error } = await this.supabase
    .from('pedidos')
    .update({ cambio_realizado: cambioRealizado })
    .eq('id', pedidoId);

  if (error) {
    console.error('Error al actualizar el cambio realizado:', error);
  } else {
    console.log('Cambio realizado actualizado con éxito.');
  }
}





async recepcionFallida(pedidoId: string): Promise<void> {
  try {
      const response = await fetch(`${this.pedidos}?id=eq.${encodeURIComponent(pedidoId)}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'apikey': this.apiKey,
              'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
              estado: 'por tomar' // Actualiza el estado del pedido
          })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error('Error al actualizar el estado del pedido:', errorText);
          throw new Error(errorText || 'Error al actualizar el estado del pedido');
      }

      console.log('Estado del pedido actualizado exitosamente a "Recepcion Fallida.');

  } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      throw error;
  }
}





async getTelefonoPorPedido(pedidoId: string): Promise<string | null> {
  try {
    // Construir la query para obtener el número de teléfono del pedido específico
    const query = `?id=eq.${encodeURIComponent(pedidoId)}`;
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
      console.error('Error al obtener el teléfono del pedido:', errorText);
      throw new Error(errorText || 'Error al obtener el teléfono del pedido');
    }

    const pedido = await response.json();

    // Verificar que el pedido contiene un teléfono
    if (pedido && pedido.length > 0 && pedido[0].telefono) {
      return pedido[0].telefono; // Retornar el número de teléfono
    } else {
      return null; // Retornar null si no se encontró un número de teléfono
    }
  } catch (error) {
    console.error('Error al obtener el teléfono del pedido:', error);
    throw error;
  }
}




  // Método para obtener el estado de un tracking dado su trackingId
  async obtenerEstadoTrackingById(trackingId: string): Promise<string | null> {
    try {
      // Realizar la consulta en la tabla tracking
      const { data, error } = await this.supabase
        .from('tracking') // Asegúrate de que el nombre de la tabla sea correcto
        .select('estado_tracking')
        .eq('id', trackingId)
        .single(); // Queremos un único resultado

      if (error) {
        console.error('Error obteniendo el estado del tracking:', error);
        return null;
      }

      return data?.estado_tracking || null; // Retornar el estado o null si no existe
    } catch (error) {
      console.error('Error inesperado al obtener el estado del tracking:', error);
      return null;
    }
  }






  async getUsuarios() {
    try {
      const { data, error } = await this.supabase
        .from('users') // Ajusta el nombre de la tabla
        .select('*')
        .eq('user_type', 'normal');
  
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { data: null, error };
    }
  }
  
  async getConductores() {
    try {
      const { data, error } = await this.supabase
        .from('users') // Ajusta el nombre de la tabla
        .select('*')
        .eq('user_type', 'conductor');
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener conductores:', error);
      return { data: null, error };
    }
  }
  
  async getPedidosAdmin() {
    try {
      const { data, error } = await this.supabase
        .from('pedidos') // Ajusta el nombre de la tabla
        .select('*');
  
      if (error) throw error;
  
      return { data, error: null };
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return { data: null, error };
    }
  }
  async updateUsuarioVerificado(usuarioId: string, verificado: boolean) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ verificado })
      .eq('id', usuarioId); // Cambia 'id' por el nombre correcto de la columna ID en tu tabla
  
    return { data, error };
  }




  async deactivateAccount(userId: string, email: string) {
    try {
      const { data, error } = await this.supabase
        .from('usuarios')
        .update({ active: false })
        .eq('id', userId)
        .single();
  
      if (error) {
        console.error('Supabase Error:', error);
        return { error };  // Ensure error is returned correctly
      }
  
      return { data };  // Return data if no error
    } catch (error) {
      console.error('Unexpected error in deactivateAccount:', error);
      return { error };  // Handle unexpected errors
    }
  }
   
  
  // Función para guardar datos de usuarios eliminados
  async saveDeletedUserConductor(userData: { email: string; user_type: string; created_at: string }) {
    const { data, error } = await this.supabase
      .from('usuario_eliminado')
      .insert([
        {
          email: userData.email,
          user_type: userData.user_type,
          created_at: userData.created_at,
          /*deleted_at: new Date(), // Agregar fecha de eliminación*/
        },
      ]);
  
    return { data, error };
  }
  
  // Función para desactivar (eliminar) un usuario
  async deleteAccountChofer(userId: string, email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);
  
    return { data, error };
  }




  // Guardar los datos del usuario eliminado
async saveDeletedUserData(userData: any) {
  const { data, error } = await this.supabase
    .from('usuario_eliminado')
    .insert([userData]);

  if (error) {
    console.error('Error al guardar los datos del usuario eliminado:', error);
  } else {
    console.log('Datos del usuario guardados correctamente:', data);
  }

  return { data, error };
}

// Elimnar Cuenta
async deletAccount(userId: string, user: string): Promise<{ error?: any }> {
  try {
    // Verificar si el usuario tiene pedidos pagados que no han sido entregados
    const { data: pedidosNoEntregados, error: pedidosError } = await this.supabase
      .from('pedidos')
      .select('id')
      .eq('usuario', user)
      .eq('pagado', true)
      .neq('estado', 'entregado');

    if (pedidosError) {
      console.error('Error al verificar pedidos no entregados:', pedidosError);
      return { error: pedidosError };
    }

    // Si hay pedidos no entregados y pagados, impedir la eliminación
    if (pedidosNoEntregados && pedidosNoEntregados.length > 0) {
      console.log('Pedidos no entregados encontrados:', pedidosNoEntregados);
      return { error: new Error('No puedes eliminar la cuenta hasta que todos tus pedidos pagados hayan sido entregados.') };
    }

    // Eliminar los pedidos con pagado = false
    const { error: deleteError } = await this.supabase
      .from('pedidos')
      .delete()
      .eq('usuario', user)
      .eq('pagado', false);  // Asegurarse de usar eq para todas las condiciones

    if (deleteError) {
      console.error('Error al eliminar pedidos no pagados:', deleteError);
      return { error: deleteError };
    }

    // Finalmente, eliminar el usuario
    const { error: userDeleteError } = await this.supabase
      .from('users')
      .delete()
      .eq('id', userId);  // Usar eq para eliminar al usuario

    if (userDeleteError) {
      console.error('Error al eliminar el usuario:', userDeleteError);
      return { error: userDeleteError };
    }

    console.log('Usuario eliminado correctamente');
    return {}; // Eliminación exitosa

  } catch (error) {
    console.error('Error inesperado durante la eliminación de la cuenta:', error);
    return { error };
  }
}




async getPedidosPorFechaRango(fechaInicio: string, fechaFin: string, emailConductor: string): Promise<any[]> {
  const { data, error } = await this.supabase
    .from('pedidos')
    .select('*')
    .or(`primer_conductor.eq.${emailConductor}, and(primer_conductor.is.null, conductor.eq.${emailConductor}, estado.eq.entregado)`) // Filtrar por conductor actual o envíos rápidos con primer_conductor null      
    .gte('fecha_tomado', fechaInicio + 'T00:00:00Z')
    .lte('fecha_tomado', fechaFin + 'T23:59:59Z');

  if (error) {
    console.error('Error al obtener pedidos por rango de fechas:', error);
    return [];
  }
  return data;
}

async getPedidosEntregadosPorFechaRango(fechaInicio: string, fechaFin: string, emailConductor: string): Promise<any[]> {
  const { data, error } = await this.supabase
    .from('pedidos')
    .select('*')
    .eq('conductor', emailConductor) // Asegúrate de usar el campo correcto
    .gte('fecha_entrega', fechaInicio + 'T00:00:00Z')
    .lte('fecha_entrega', fechaFin + 'T23:59:59Z');

  if (error) {
    console.error('Error al obtener pedidos entregados por rango de fechas:', error);
    return [];
  }
  return data;
}




subscribeToPedidosUpdates(callback: (pedido: any) => void) {
  this.supabase
    .channel('realtime-pedidos')  // nombre único para la suscripción
    .on(
      'postgres_changes', 
      { event: '*', schema: 'public', table: 'pedidos' },
      (payload) => {
        console.log('Cambio detectado en pedidos:', payload);
        callback(payload.new);  // callback con los datos actualizados
      }
    )
    .subscribe();
}













  
}