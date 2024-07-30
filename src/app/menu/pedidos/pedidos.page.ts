import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  orders: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      const tokenData = await this.supabaseService.getToken();
      const accessToken = tokenData.token;
      this.orders = await this.supabaseService.getUserOrders(accessToken);
    } catch (error) {
      console.error('Error al cargar los pedidos del comprador:', error);
    }
  }
}
