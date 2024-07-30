import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit {
  items: any[] = [];

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    try {
      const tokenData = await this.supabaseService.getToken();
      const accessToken = tokenData.token;
      this.items = await this.supabaseService.getUserItems(accessToken);
    } catch (error) {
      console.error('Error al cargar los ítems del vendedor:', error);
    }
  }
}
