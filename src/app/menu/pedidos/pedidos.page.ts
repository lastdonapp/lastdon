// pedidos.page.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  pedidos: any[] = [];
  usuario: any = this.supabaseService.getCurrentUser();
  dimensiones: any = ''
  observaciones :string = '';
  direccionPedido :string = '';
  direccionEntrega :string = '';
  valorCambioPedido : number =1000;

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router) { }

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    try {
      this.pedidos = await this.supabaseService.getPedidos(this.usuario.email);
      this.pedidos.forEach((pedido: any) => {
        if (pedido.dimensiones) {
          pedido.dimensiones = JSON.parse(pedido.dimensiones);
        }
        // Agrega la propiedad mostrarFormulario
        pedido.mostrarFormulario = false;
      });
      if (this.pedidos.length === 0) {
        this.showToast('No tienes pedidos actualmente.');
      }
    } catch (error) {
      this.showToast('Error al cargar los pedidos.');
      console.error('Error al cargar los pedidos:', error);
    }
  }

  // Mostrar el formulario y detener la propagación del evento
  mostrarFormulario(id: string, event: Event) {
    event.stopPropagation(); // Detener la propagación del evento
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) {
      pedido.mostrarFormulario = true; // Mostrar el formulario
    }
  }

  // Función para cerrar el formulario
  cerrarFormulario(id: string, event: Event) {
    event.stopPropagation(); // Detener la propagación del evento
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) {
      pedido.mostrarFormulario = false; // Cerrar el formulario
    }
  }

  // Navega a los detalles solo si el formulario no está abierto
  async verDetalles(id: string, mostrarFormulario: boolean) {
    if (!mostrarFormulario) {
      this.router.navigate(['menu/detalles-pedido', id]);
    } else {
      console.log('El formulario de cambio está activo, no se navega a los detalles.');
    }
  }

  confirmarCambio() {
    console.log('Observaciones:', this.observaciones);
    console.log('Dirección de Pedido:', this.direccionPedido);
    console.log('Dirección de Entrega:', this.direccionEntrega);
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}