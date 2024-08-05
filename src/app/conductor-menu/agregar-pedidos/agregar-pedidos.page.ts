// agregar-pedidos.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-agregar-pedidos',
  templateUrl: './agregar-pedidos.page.html',
  styleUrls: ['./agregar-pedidos.page.scss'],
})
export class AgregarPedidosPage implements OnInit {
  pedidos: any[] = [];
  usuario: any = this.supabaseService.getCurrentUser(); // Deberías obtener esto desde la sesión o estado del usuario

  constructor(
    private supabaseService: SupabaseService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPedidosPorTomar();
  }

  async loadPedidosPorTomar() {
    try {
      this.pedidos = await this.supabaseService.getPedidosPorTomar();
    } catch (error) {
      console.error('Error al cargar pedidos por tomar:', error);
    }
  }

  async verDetalles(id: string) {
    // Navega a la página de detalles del pedido
    this.router.navigate(['conductor-menu/detalles-pedido', id]);
  }

  async tomarPedido(pedidoId: string) {
    try {
      await this.supabaseService.tomarPedido(pedidoId, this.usuario.email);
      // Mostrar mensaje de éxito
      const toast = await this.toastController.create({
        message: 'Pedido tomado con éxito',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Recargar los pedidos después de tomar uno
      this.loadPedidosPorTomar();
    } catch (error) {
      console.error('Error al tomar el pedido:', error);
    }
  }
}
