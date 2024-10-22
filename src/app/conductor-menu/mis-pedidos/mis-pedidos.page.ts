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
  pedidosFiltrados: any[] = [];
  pedidosTabla: any[] = []; // Para mostrar los pedidos en la tabla (filtrados por fecha)

  selectedState: string = ''; // Valor para filtrar pedidos
  selectedStateTable: string = ''; // Valor para filtrar pedidos

  usuario: any = this.supabaseService.getCurrentUser();
  capturedPhoto: string = ''; // Variable para almacenar la URL de la foto capturada 
  photoUrl: string = ''; // URL de la foto del pedido


  
  totalPedidosTomados: number = 0;
  totalPedidosEntregados: number = 0;
  filtroActual: string = 'hoy';
  totalPedidosTomadosEnvioRapido: number =0;

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router, private alertController: AlertController) {}

  ngOnInit() {
    this.loadPedidos();
  }

  async loadPedidos() {
    try {
      // Aquí debes obtener el usuario actual y su email
      const user = this.supabaseService.getCurrentUser();
  
      // Verificar si hay un usuario y su email
      if (!user || !user.email) {
        console.error('No se pudo obtener el usuario actual o su email.');
        return; // Salir si no hay usuario
      }
  
      const email = user.email;
      // Obtener pedidos del conductor utilizando solo el filtro por conductor
      await this.getPedidos(email);
    // Iterar sobre los pedidos
  
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }
  
  async getPedidos(email: string) {
    try {
      const pedidosFiltrados = await this.supabaseService.getPedidosPorConductor(email, this.selectedStateTable)
      this.pedidosFiltrados = pedidosFiltrados; // Asignar los pedidos obtenidos a la propiedad local
     // Obtener pedidos normales utilizando el filtro por conductor
      const pedidos = await this.supabaseService.getPedidosPorConductor(email, this.selectedState);
      this.pedidos = pedidos; // Asignar los pedidos obtenidos a la propiedad local

    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
    }
  }
  




  async contarPedidosPorEstado(): Promise<void> {
    const emailConductor = this.usuario.email; // Obtener el email del conductor actual 

    let  contadorHistoricoTomados = 0;  // Inicialmente en 0
    let  contadorHistoricoEntregados = 0;  // Inicialmente en 0

    // Contar pedidos tomados
    const pedidosTomados = await this.supabaseService.getPedidosPorFechaRango('2024-01-01', '2044-12-31', emailConductor);
    this.totalPedidosTomados = pedidosTomados.filter(pedido => pedido.primer_conductor === emailConductor ).length;
    // Incrementar el contador histórico por cada pedido que haya pasado por el conductor
    pedidosTomados.forEach(pedido => {
      if (pedido.historicoEstados.includes(emailConductor)) {
        contadorHistoricoTomados += 1;
      }
    });

    // Contar pedidos entregados
    const pedidosEntregados = await this.supabaseService.getPedidosEntregadosPorFechaRango('2024-01-01', '2044-12-31', emailConductor);
    this.totalPedidosEntregados = pedidosEntregados.filter(pedido => pedido.conductor === emailConductor).length;
  pedidosEntregados.forEach(pedido => {
    if (pedido.historicoEstados.includes(emailConductor)) {
      contadorHistoricoEntregados += 1;
    }
  });

}

  // Método para aplicar el filtro según la opción seleccionada
  async filtrarPedidos(filtro: string) {
    this.filtroActual = filtro;
    await this.loadPedidos(); // Recargar los pedidos aplicando los filtros unificados

    let fechaInicio: string;
    let fechaFin: string;

    const hoy = new Date();
    const ayer = new Date(hoy);
    const todos = new Date('01/01/2000');

    ayer.setDate(hoy.getDate() - 1);

    switch (filtro) {
      case 'hoy':
        fechaInicio = hoy.toISOString().split('T')[0];
        fechaFin = fechaInicio;
        break;
      case 'ayer':
        fechaInicio = ayer.toISOString().split('T')[0];
        fechaFin = fechaInicio;
        break;
      case 'semana':
        const semanaInicio = new Date(hoy);
        semanaInicio.setDate(hoy.getDate() - 7);
        fechaInicio = semanaInicio.toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'todos':
        fechaInicio = todos.toISOString().split('T')[0]; // Muy antigua
        fechaFin = hoy.toISOString().split('T')[0]; // Fecha actual
        break;
      default:
        
        return;
    }
    const emailConductor = this.usuario.email;

    // Obtener los pedidos según el filtro
    const pedidosTomados = await this.supabaseService.getPedidosPorFechaRango(fechaInicio, fechaFin, emailConductor);
    const pedidosEntregados = await this.supabaseService.getPedidosEntregadosPorFechaRango(fechaInicio, fechaFin, emailConductor);
    // Combinar los resultados de pedidos tomados y entregados sin duplicados
    const pedidosCombinados = [...pedidosTomados, ...pedidosEntregados];

    // Eliminar duplicados basados en el id del pedido
    this.pedidosFiltrados = pedidosCombinados.filter((pedido, index, self) => index === self.findIndex((p) => p.id === pedido.id));
    console.log(pedidosTomados);
    console.log(pedidosEntregados);

    this.totalPedidosTomados = pedidosTomados.length;
    this.totalPedidosEntregados = pedidosEntregados.length;
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
      // Obtener el trackingId basado en el pedidoId
      const trackingId = await this.supabaseService.getTrackingById(pedidoId);
  
      if (!trackingId) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo obtener el tracking del pedido.',
          buttons: ['Aceptar']
        });
        await alert.present();
        return; // Detener la ejecución si no se encuentra el tracking
      }
  
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
        header: '¿Confirmar el ingreso a centro de distribución?',
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
              try {
                // Marcar el pedido como ingresado al centro de distribución
                await this.supabaseService.almacenarPedido(pedidoId);
  
                // Registrar al primer conductor
                await this.supabaseService.registroPrimerConductor(pedidoId, this.usuario.email);
                
                // Liberar al conductor
                await this.supabaseService.liberarConductor(pedidoId);
                // Liberar el tracking del conductor
                await this.supabaseService.liberarTrackingConductor(trackingId);
  
                const toast = await this.toastController.create({
                  message: 'Pedido marcado como ingresado a centro de distribución',
                  duration: 2000,
                  color: 'success'
                });
                await toast.present();
  
                this.loadPedidos(); // Recargar la lista de pedidos
              } catch (error) {
                console.error('Error al almacenar pedido:', error);
                const toast = await this.toastController.create({
                  message: 'Error al ingresar pedido',
                  duration: 2000,
                  color: 'danger'
                });
                await toast.present();
              }
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
  


  async tomarFotoEntrega(pedidoId: string) {
    try {
      // Tomar la foto usando el servicio
      const foto: File = await this.supabaseService.takePicture();
  
      if (foto) {
        // Generar el path único para la imagen
        const path = `pedidos/${pedidoId}/fotoEnvio_final-${new Date().getTime()}.jpeg`;
  
        // Subir la imagen a Supabase
        const { data, error } = await this.supabaseService.uploadImage(foto, path);
  
        if (error) {
          console.error('Error subiendo la imagen:', error);
          await this.showToast('Error al subir la foto de entrega', 'danger');
          return;
        }
  
        // Obtener la URL pública de la imagen
        const { publicURL, error: urlError } = await this.supabaseService.getImageUrl(path);
  
        if (urlError || !publicURL) {
          console.error('Error obteniendo la URL pública:', urlError);
          await this.showToast('Error al obtener la URL de la imagen', 'danger');
          return;
        }
  
        // Guardar la URL de la imagen en la tabla 'pedidos'
        await this.supabaseService.updatePedidoFotoEnvio(pedidoId, publicURL);
  
        // Mostrar un mensaje de éxito
        await this.showToast('Foto de entrega subida con éxito', 'success');
      }
    } catch (error) {
      console.error('Error al capturar o subir la foto:', error);
      await this.showToast('Error al procesar la foto de entrega', 'danger');
    }
  }
  
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }






  async marcarEnvioRapido(pedidoId: string) {
    try {
      // Verificar si el tracking está iniciado antes de continuar
      const trackingIniciado = await this.supabaseService.verificarTrackingIniciado(pedidoId);

      if (!trackingIniciado) {
        const alert = await this.alertController.create({
          header: 'Tracking no iniciado',
          message: 'Debe iniciar el tracking antes de marcar este pedido como Envío Rápido.',
          buttons: ['Aceptar']
        });
        await alert.present();
        return; // Detener la ejecución si el tracking no ha sido iniciado
      }
  
      // Si el tracking está iniciado, continuar con la lógica de confirmación de Envío Rápido
      const alert = await this.alertController.create({
        header: 'Confirmar Envío Rápido',
        message: '¿Está seguro de que desea marcar este pedido como Envío Rápido?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('envío rápido cancelado por el usuario');
            }
          },
          {
            text: 'Confirmar',
            handler: async () => {
              try {
                // Llamar al servicio para cambiar el estado del pedido
                await this.supabaseService.envioRapido(pedidoId, this.usuario.email);
                //registro primer conductor
                await this.supabaseService.registroPrimerConductor(pedidoId, this.usuario.email);

                const toast = await this.toastController.create({
                  message: 'Pedido marcado como Envío Rápido',
                  duration: 2000,
                  color: 'success'
                });
                await toast.present();
                
                this.loadPedidos(); // Recargar la lista de pedidos después de la operación
              } catch (error) {
                const toastError = await this.toastController.create({
                  message: 'Error al marcar el pedido como Envío Rápido',
                  duration: 2000,
                  color: 'danger'
                });
                await toastError.present();
                console.error('Error al procesar el envío rápido:', error);
              }
            }
          }
        ]
      });
  
      await alert.present();
    } catch (error) {
      console.error('Error al procesar el Envío Rápido:', error);
    }
  }
  
  




}






  