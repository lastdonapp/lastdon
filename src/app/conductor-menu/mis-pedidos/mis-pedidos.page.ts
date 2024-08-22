import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';// Asegúrate de ajustar la ruta según tu estructura
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit {
  pedidos: any[] = [];
  selectedState: string = ''; // Valor para filtrar pedidos

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router) {}

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
      const pedidos = await this.supabaseService.getPedidosPorConductor(email, this.selectedState);
      this.pedidos = pedidos;
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
    }
  }

  async entregarPedido(pedidoId: string) {
    try {
      await this.supabaseService.entregarPedido(pedidoId);
      const toast = await this.toastController.create({
        message: 'Pedido marcado como entregado',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      this.loadPedidos(); // Recargar la lista de pedidos
    } catch (error) {
      console.error('Error al entregar el pedido:', error);
    }
  }

  async verDetalles(id: string) {
    // Navega a la página de detalles del pedido
    this.router.navigate(['conductor-menu/detalles-pedido', id]);
  }

  filterPedidos() {
    // Aplicar filtro por estado
    this.loadPedidos();
  }
}
