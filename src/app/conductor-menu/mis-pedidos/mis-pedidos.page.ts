import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';// Asegúrate de ajustar la ruta según tu estructura
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TrackingService } from 'src/app/services/tracking.service';




@Component({
  selector: 'app-mis-pedidos',
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
})
export class MisPedidosPage implements OnInit {
  pedidos: any[] = [];
  selectedState: string = ''; // Valor para filtrar pedidos
  usuario: any = this.supabaseService.getCurrentUser();
  capturedPhoto: string = ''; // Variable para almacenar la URL de la foto capturada 
  photoUrl: string = ''; // URL de la foto del pedido
  pedidosFiltrados: any[] = [];
  pedidosTabla: any[] = []; // Para mostrar los pedidos en la tabla (filtrados por fecha)


  totalPedidosTomados: number = 0;
  totalPedidosEntregados: number = 0;
  filtroActual: string = 'hoy';
  totalPedidosTomadosEnvioRapido: number =0;



  constructor(private readonly supabaseService: SupabaseService, private readonly toastController: ToastController, private readonly router: Router, private readonly alertController: AlertController,
    private readonly trackingService: TrackingService
  ) {}

  ngOnInit() {
    this.loadPedidos();
    this.suscribirseAPedidos();
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
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }
  
  async getPedidos(email: string) {
    try {
      // Obtener pedidos normales utilizando el filtro por conductor
      const pedidos = await this.supabaseService.getPedidosPorConductor(email, this.selectedState);
      this.pedidos = pedidos; // Asignar los pedidos obtenidos a la propiedad local
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
    // Crear el alert para la confirmación
    const alert = await this.alertController.create({
      header: 'Confirmar Entrega',
      message: '¿Está seguro de que desea marcar este pedido como recibido?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Recepción cancelada por el usuario');
          }
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              // Verificar e iniciar el tracking antes de cambiar el estado del pedido
              const trackingIniciado = await this.supabaseService.verificarTrackingIniciado(pedidoId);

              if (!trackingIniciado) {
                try {
                  await this.trackingService.iniciarTracking(pedidoId); // Iniciar tracking
                  
                  // Verificar si el tracking fue realmente creado
                  const trackingConfirmado = await this.supabaseService.verificarTrackingCreado(pedidoId);

                  if (!trackingConfirmado) {
                    throw new Error('No se pudo verificar la creación del tracking en la base de datos.');
                  }

                  const toastTracking = await this.toastController.create({
                    message: 'Tracking iniciado exitosamente',
                    duration: 2000,
                    color: 'success'
                  });
                  await toastTracking.present();
                } catch (error) {
                  const alert = await this.alertController.create({
                    header: 'Error al iniciar tracking',
                    message: error instanceof Error ? error.message : 'Error desconocido',
                    buttons: ['Aceptar']
                  });
                  await alert.present();
                  return; // Salir si no se pudo iniciar el tracking
                }
              }

              // Marcar el pedido como recepcionado solo si el tracking fue iniciado exitosamente
              await this.supabaseService.recepcionarPedido(pedidoId);
              const toast = await this.toastController.create({
                message: 'Pedido marcado como recepcionado',
                duration: 2000,
                color: 'success'
              });
              await toast.present();

              // Recargar la lista de pedidos
              this.loadPedidos(); 

            } catch (error) {
              console.error('Error al recepcionar el pedido:', error);
              const alert = await this.alertController.create({
                header: 'Error',
                message: 'Hubo un error al marcar el pedido como recepcionado.',
                buttons: ['Aceptar']
              });
              await alert.present();
            }
          }
        }
      ]
    });

    // Mostrar el alert para que el conductor confirme
    await alert.present();

  } catch (error) {
    console.error('Error al iniciar la recepción del pedido:', error);
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un error al procesar su solicitud.',
      buttons: ['Aceptar']
    });
    await alert.present();
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
        const {  error } = await this.supabaseService.uploadImage(foto, path);
  
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
                await this.supabaseService.envioRapido(pedidoId);
                
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






  async contactarPorWsp(pedidoId: string) {
    try {
      // Obtener el número de teléfono usando el nuevo método
      const telefono = await this.supabaseService.getTelefonoPorPedido(pedidoId);
  
      if (telefono) {
        const url = `https://wa.me/${telefono}`;
        window.open(url, '_blank');
      } else {
        console.error('No se encontró un número de teléfono para este pedido.');
      }
    } catch (error) {
      console.error('Error al contactar por WhatsApp:', error);
    }
  }
  




  async recepcionFallidaYLiberar(pedidoId: string) {
    try {
      const alert = await this.alertController.create({
        header: '¿Confirmar Recepción Fallida?',
        message: '¿Está seguro de que desea marcar este pedido como "Recepción Fallida" y liberar al conductor?',
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
              try {
                // Actualizar el estado del pedido a "por tomar" (Recepción Fallida)
                await this. supabaseService.recepcionFallida(pedidoId);
                
                // Liberar al conductor asociado con el pedido
                await this. supabaseService.liberarConductor(pedidoId);
  
                const toast = await this.toastController.create({
                  message: 'Recepción fallida y conductor liberado exitosamente',
                  duration: 2000,
                  color: 'success'
                });
                await toast.present();
  
                // Recargar la lista de pedidos, si aplica
                this.loadPedidos(); 
              } catch (error) {
                console.error('Error al procesar la recepción fallida y liberar conductor:', error);
                const toast = await this.toastController.create({
                  message: 'Error al procesar la acción',
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
      console.error('Error al mostrar la alerta de confirmación:', error);
    }
  }
  
  async marcarEntregaFallida(pedidoId: string) {
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
  
      const alert = await this.alertController.create({
        header: '¿Confirmar entrega fallida?',
        message: '¿Está seguro de que desea marcar este pedido como "Entrega Fallida"?',
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
  
                await this.supabaseService.almacenarPedido(pedidoId);
  
                // Liberar al conductor
                await this.supabaseService.liberarConductor(pedidoId);
  
                // Liberar el tracking del conductor
                await this.supabaseService.liberarTrackingConductor(trackingId);
  
                const toast = await this.toastController.create({
                  message: 'Pedido marcado como "Entrega Fallida"',
                  duration: 2000,
                  color: 'success'
                });
                await toast.present();
  
                this.loadPedidos(); // Recargar la lista de pedidos
              } catch (error) {
                console.error('Error al actualizar el pedido:', error);
                const toast = await this.toastController.create({
                  message: 'Error al marcar como "Entrega Fallida"',
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



  suscribirseAPedidos() {
    this.supabaseService.subscribeToPedidosUpdates((nuevoPedido) => {
      console.log('Pedido actualizado:', nuevoPedido);
      const index = this.pedidos.findIndex(p => p.id === nuevoPedido.id);
      if (index !== -1) {
        this.pedidos[index] = nuevoPedido;  // Actualizar el pedido en la lista
        this.pedidosFiltrados = [...this.pedidos];  // Actualizar los pedidos filtrados
      }
    });
  }
  


}






  












