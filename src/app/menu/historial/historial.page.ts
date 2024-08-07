import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';// Asegúrate de ajustar la ruta según tu estructura
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  pedidos: any[] = [];
  selectedState: string = ''; // Valor para filtrar pedidos

  constructor(private supabaseService: SupabaseService, private toastController: ToastController) {}

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    try {
      // Aquí debes obtener el usuario actual  y su email
      const user = this.supabaseService.getCurrentUser();
      const email = user.email;

      // Obtener pedidos del conductor y aplicar filtro de estado
      await this.getPedidos(email);
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }

  async getPedidos(email: string) {
    try {
      const pedidos = await this.supabaseService.getPedidosPorUsuario(email, this.selectedState);
      this.pedidos = pedidos;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
    }
  }


  filterPedidos() {
    // Aplicar filtro por estado
    this.loadPedidos();
  }
}
