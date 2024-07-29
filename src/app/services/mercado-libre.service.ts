import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoLibreService {

  private apiUrl = 'https://api.mercadolibre.com';

  constructor(private http: HttpClient, private supabaseService: SupabaseService) { }

  getOrders(): Observable<any> {
    const user = this.supabaseService.getCurrentUser();
    
    console.log('Current user:', user); // Log para ver los detalles del usuario

    if (user && user.token) {
      console.log('User token:', user.token); // Log para ver el token del usuario
      const headers = new HttpHeaders().set('Authorization', `Bearer ${user.token}`);
      const url = `${this.apiUrl}/orders/search?seller_email=${user.email}`;
      
      console.log('Request URL:', url); // Log para ver la URL de la solicitud

      return this.http.get(url, { headers });
    } else {
      console.error('No user found or missing token');
      return of({ error: 'No user found or missing token' });
    }
  }
}
