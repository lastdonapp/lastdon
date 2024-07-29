import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit {
  userInfo: any;

  constructor(private supabaseService: SupabaseService) { }

  async ngOnInit() {
    try {
      const tokenData = await this.supabaseService.getToken();
      const accessToken = tokenData.token; // Suponiendo que la propiedad del token es 'token'
      this.userInfo = await this.supabaseService.getUserInfo(accessToken);
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }
}
