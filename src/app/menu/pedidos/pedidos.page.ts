import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  userInfo: any;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      const tokenData = await this.supabaseService.getToken();
      const accessToken = tokenData.token; // Suponiendo que la propiedad del token es 'token'
      this.userInfo = await this.supabaseService.getUserInfo(accessToken);
    } catch (error) {
      console.error('Error al cargar la información del usuario:', error);
    }
  }
}
