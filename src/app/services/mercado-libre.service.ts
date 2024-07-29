import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MercadoLibreService {

  constructor(private http: HttpClient, private supabaseService: SupabaseService) { }

  async getOrders() {
    const currentUser = this.supabaseService.getCurrentUser();
    console.log('Current user:', currentUser);
  
    if (!currentUser) {
      console.error('No current user found');
      return { error: 'No current user found' };
    }
  
    const tokens = await this.supabaseService.getToken();
    if (!tokens || !tokens.token) {
      console.error('No user found or missing token');
      return { error: 'No user found or missing token' };
    }
  
    const url = `https://api.mercadolibre.com/orders/search?seller=${currentUser.id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.token}`,
        'Content-Type': 'application/json'
      }
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al obtener los pedidos:', errorData);
      return { error: errorData.message || 'Error al obtener los pedidos' };
    }
  
    const orders = await response.json();
    return orders;
  }
  
}
