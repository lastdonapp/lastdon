import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AlertController } from '@ionic/angular';

interface Pedido {
  id: string;
  pagado: boolean;
  nombre_pedido?: string;
  fecha?: string;
  direccion_pedido?: string;
  direccion_entrega?: string;
  comuna?: string;
  telefono?: string;
  // Otros campos relevantes
}

@Component({
  selector: 'app-agregar-pedidos',
  templateUrl: './agregar-pedidos.page.html',
  styleUrls: ['./agregar-pedidos.page.scss'],
})
export class AgregarPedidosPage implements OnInit {
  pedidos: Pedido[] = [];
  usuario: any = this.supabaseService.getCurrentUser(); // Deberías obtener esto desde la sesión o estado del usuario

  constructor(
    private supabaseService: SupabaseService,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPedidosPorTomar();
  }

  async loadPedidosPorTomar() {
    try {
      const allPedidos: Pedido[] = await this.supabaseService.getPedidosPorTomar();
      this.pedidos = allPedidos.filter((pedido: Pedido) => pedido.pagado === true);
    } catch (error) {
      console.error('Error al cargar pedidos por tomar:', error);
    }
  }

  async verDetalles(id: string) {
    this.router.navigate(['conductor-menu/detalles-pedido', id]);
  }

  async tomarPedido(pedidoId: string) {
    try {
      const alert = await this.alertController.create({
        header: 'Confirmar Acción',
        message: '¿Está seguro de tomar este pedido?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Acción cancelada por el usuario');
            }
          },
          {
            text: 'Confirmar',
            handler: async () => {
              await this.supabaseService.tomarPedido(pedidoId, this.usuario.email);
              const toast = await this.toastController.create({
                message: 'Pedido tomado con éxito',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
              this.loadPedidosPorTomar();
            }
          }
        ]
      });
  
      await alert.present();
    } catch (error) {
      console.error('Error al tomar el pedido:', error);
    }
  }
}