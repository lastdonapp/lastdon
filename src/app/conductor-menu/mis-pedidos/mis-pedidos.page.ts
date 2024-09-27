import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';// Asegúrate de ajustar la ruta según tu estructura
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit {
  pedidos: any[] = [];
  selectedState: string = ''; // Valor para filtrar pedidos

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router, private alertController: AlertController) {}

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
        // Verificar si el tracking ha sido iniciado
        const trackingIniciado = await this.supabaseService.verificarTrackingIniciado(pedidoId);
        
        if (!trackingIniciado) {
            const alertTracking = await this.alertController.create({
                header: 'Tracking no iniciado',
                message: 'Debe iniciar el tracking antes de entregar el pedido.',
                buttons: ['Aceptar']
            });
            await alertTracking.present();
            return; // Detener la ejecución si el tracking no ha sido iniciado
        }

        // Continuar con la entrega si el tracking ya fue iniciado
        const alert = await this.alertController.create({
            header: 'Confirmar Entrega',
            message: '¿Está seguro de marcar este pedido como entregado?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('Entrega cancelada por el usuario');
                    }
                },
                {
                    text: 'Confirmar',
                    handler: async () => {
                        await this.supabaseService.entregarPedido(pedidoId);
                        const toast = await this.toastController.create({
                            message: 'Pedido marcado como entregado',
                            duration: 2000,
                            color: 'success'
                        });
                        await toast.present();
                        this.loadPedidos(); // Recargar la lista de pedidos
                    }
                }
            ]
        });

        await alert.present();
    } catch (error) {
        console.error('Error al entregar el pedido:', error);
    }
}




  async recepcionar(pedidoId: string) {
    try {
      const alert = await this.alertController.create({
        header: 'Confirmar Entrega',
        message: '¿Está seguro de que desea marcar este pedido como recibido?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('recepción cancelada por el usuario');
            }
          },
          {
            text: 'Confirmar',
            handler: async () => {
              await this.supabaseService.recepcionarPedido(pedidoId);
              const toast = await this.toastController.create({
                message: 'Pedido marcado como recepcionado',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
              this.loadPedidos(); // Recargar la lista de pedidos
            }
          }
        ]
      });
  
      await alert.present();
    } catch (error) {
      console.error('Error al entregar el pedido:', error);
    }
  }




  async ingresarCentroDistribucion(pedidoId: string) {
    try {
        const trackingIniciado = await this.supabaseService.verificarTrackingIniciado(pedidoId);
        if (!trackingIniciado) {
            const alert = await this.alertController.create({
                header: 'Tracking no iniciado',
                message: 'Debe iniciar el tracking antes de marcar este pedido como ingresado a centro de distribución.',
                buttons: ['Aceptar']
            });
            await alert.present();
            return; // Detener la ejecución si el tracking no ha sido iniciado
        }

        const alert = await this.alertController.create({
            header: '¿ Confirmar el ingreso a centro de distribución ?',
            message: '¿Está seguro de que desea marcar este pedido como ingresado a centro de distribución?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cambio de estado cancelado por el usuario');
                    }
                },
                {
                    text: 'Confirmar',
                    handler: async () => {
                        await this.supabaseService.almacenarPedido(pedidoId);
                        const toast = await this.toastController.create({
                            message: 'Pedido marcado como ingresado a centro de distribución',
                            duration: 2000,
                            color: 'success'
                        });
                        await toast.present();
                        this.loadPedidos(); // Recargar la lista de pedidos
                    }
                }
            ]
        });

        await alert.present();
    } catch (error) {
        console.error('Error al cambiar el estado del pedido:', error);
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
