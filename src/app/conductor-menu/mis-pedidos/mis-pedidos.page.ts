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
<<<<<<< HEAD
  selectedState: string = ''; // Valor para filtrar pedidos
=======
  pedidosFiltrados: any[] = [];
  pedidosTabla: any[] = []; // Para mostrar los pedidos en la tabla (filtrados por fecha)

  selectedState: string = ''; // Valor para filtrar pedidos
  selectedStateTable: string = ''; // Valor para filtrar pedidos

>>>>>>> master
  usuario: any = this.supabaseService.getCurrentUser();
  capturedPhoto: string = ''; // Variable para almacenar la URL de la foto capturada 
  photoUrl: string = ''; // URL de la foto del pedido


<<<<<<< HEAD
  totalPedidosTomados: number = 0;
  totalPedidosEntregados: number = 0;
  filtroActual: string = 'hoy';
=======
  
  totalPedidosTomados: number = 0;
  totalPedidosEntregados: number = 0;
  filtroActual: string = 'hoy';
  totalPedidosTomadosEnvioRapido: number =0;
>>>>>>> master

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router, private alertController: AlertController) {}

  ngOnInit() {
<<<<<<< HEAD
    this.usuario = this.supabaseService.getCurrentUser();
    this.loadPedidos();
    this.filtrarPedidos('hoy');
    this.contarPedidosPorEstado(); // Llamar para inicializar contadores

=======
    this.loadPedidos();
>>>>>>> master
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
<<<<<<< HEAD
  
      // Obtener pedidos del conductor utilizando solo el filtro por conductor
      await this.getPedidos(email);
=======
      // Obtener pedidos del conductor utilizando solo el filtro por conductor
      await this.getPedidos(email);
    // Iterar sobre los pedidos
  
>>>>>>> master
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }
  
  async getPedidos(email: string) {
    try {
<<<<<<< HEAD
      // Obtener pedidos normales utilizando el filtro por conductor
      const pedidos = await this.supabaseService.getPedidosPorConductor(email, this.selectedState);
      this.pedidos = pedidos; // Asignar los pedidos obtenidos a la propiedad local
=======
      const pedidosFiltrados = await this.supabaseService.getPedidosPorConductor(email, this.selectedStateTable)
      this.pedidosFiltrados = pedidosFiltrados; // Asignar los pedidos obtenidos a la propiedad local
     // Obtener pedidos normales utilizando el filtro por conductor
      const pedidos = await this.supabaseService.getPedidosPorConductor(email, this.selectedState);
      this.pedidos = pedidos; // Asignar los pedidos obtenidos a la propiedad local

>>>>>>> master
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
    }
  }
<<<<<<< HEAD
=======
  

>>>>>>> master



  async contarPedidosPorEstado(): Promise<void> {
<<<<<<< HEAD
    const emailConductor = this.usuario.email; // Obtener el email del conductor actual

    let  contadorHistoricoTomados = 0;  // Inicialmente en 0
    let  contadorHistoricoEntregados = 0;  // Inicialmente en 0

    // Contar pedidos tomados
    const pedidosTomados = await this.supabaseService.getPedidosPorFechaRango('2024-01-01', '2034-12-31', emailConductor);
    this.totalPedidosTomados = pedidosTomados.filter(pedido => pedido.primer_conductor === emailConductor).length;

    // Incrementar el contador histórico por cada pedido que haya pasado por el estado 'tomado'
=======
    const emailConductor = this.usuario.email; // Obtener el email del conductor actual 

    let  contadorHistoricoTomados = 0;  // Inicialmente en 0
    let  contadorHistoricoEntregados = 0;  // Inicialmente en 0
    let  contadorHistoricoTomadosEnvioRapido = 0;  // Inicialmente en 0

    // Contar pedidos tomados
    const pedidosTomados = await this.supabaseService.getPedidosPorFechaRango('2024-01-01', '2044-12-31', emailConductor);
    this.totalPedidosTomados = pedidosTomados.filter(pedido => pedido.primer_conductor === emailConductor ).length;

    // Incrementar el contador histórico por cada pedido que haya pasado por el conductor
>>>>>>> master
    pedidosTomados.forEach(pedido => {
      if (pedido.historicoEstados.includes(emailConductor)) {
        contadorHistoricoTomados += 1;
      }
    });
<<<<<<< HEAD
    // Contar pedidos entregados
    const pedidosEntregados = await this.supabaseService.getPedidosEntregadosPorFechaRango('2024-01-01', '2034-12-31', emailConductor);
    this.totalPedidosEntregados = pedidosEntregados.filter(pedido => pedido.conductor === emailConductor).length;
  // Incrementar el contador histórico por cada pedido que haya pasado por el estado 'tomado'
=======
    // Contar pedidos envio rapido
    const pedidosTomadosEnvioRapido = await this.supabaseService.getPedidosPorFechaRango('2024-01-01', '2044-12-31', emailConductor);
    this.totalPedidosTomadosEnvioRapido = pedidosTomadosEnvioRapido.filter(pedido =>  pedido.primer_conductor === null && pedido.conductor === emailConductor ).length;
    

    // Incrementar el contador histórico por cada pedido que haya pasado por el conductor
    pedidosTomadosEnvioRapido.forEach(pedido => {
      if (pedido.historicoEstados.includes(emailConductor && emailConductor)) {
        contadorHistoricoTomadosEnvioRapido += 1;
      }
   
    });

    // Contar pedidos entregados
    const pedidosEntregados = await this.supabaseService.getPedidosEntregadosPorFechaRango('2024-01-01', '2044-12-31', emailConductor);
    this.totalPedidosEntregados = pedidosEntregados.filter(pedido => pedido.conductor === emailConductor).length;
  // Incrementar el contador histórico por cada pedido que haya pasado por el conductor
>>>>>>> master
  pedidosEntregados.forEach(pedido => {
    if (pedido.historicoEstados.includes(emailConductor)) {
      contadorHistoricoEntregados += 1;
    }
  });
<<<<<<< HEAD
  
  }
  
=======
}
>>>>>>> master


  // Método para aplicar el filtro según la opción seleccionada
  async filtrarPedidos(filtro: string) {
    this.filtroActual = filtro;
    await this.loadPedidos(); // Recargar los pedidos aplicando los filtros unificados

    let fechaInicio: string;
    let fechaFin: string;

    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    switch (filtro) {
      case 'hoy':
        this.loadPedidos();
        fechaInicio = hoy.toISOString().split('T')[0];
        fechaFin = fechaInicio;
        break;
      case 'ayer':
        this.loadPedidos();
        fechaInicio = ayer.toISOString().split('T')[0];
        fechaFin = fechaInicio;
        break;
      case 'semana':
        this.loadPedidos();
        const semanaInicio = new Date(hoy);
        semanaInicio.setDate(hoy.getDate() - 7);
        fechaInicio = semanaInicio.toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      default:
<<<<<<< HEAD
=======
        
>>>>>>> master
        return;
    }
    const emailConductor = this.usuario.email;

    // Obtener los pedidos según el filtro
    const pedidosTomados = await this.supabaseService.getPedidosPorFechaRango(fechaInicio, fechaFin, emailConductor);
<<<<<<< HEAD
    const pedidosEntregados = await this.supabaseService.getPedidosEntregadosPorFechaRango(fechaInicio, fechaFin, emailConductor);

    this.pedidos = pedidosTomados; // Mostrar los recibidos en la tabla

    this.totalPedidosTomados = pedidosTomados.length;
=======
    const pedidosTomadosEnvioRapido = await this.supabaseService.getPedidosPorFechaRango(fechaInicio, fechaFin, emailConductor);
    const pedidosEntregados = await this.supabaseService.getPedidosEntregadosPorFechaRango(fechaInicio, fechaFin, emailConductor);

    this.pedidosFiltrados  = pedidosTomados // Mostrar los recibidos en la tabla

    console.log(pedidosTomados);
    console.log(pedidosEntregados);
    console.log(pedidosTomadosEnvioRapido);

    this.totalPedidosTomados = pedidosTomados.length;
    this.totalPedidosTomadosEnvioRapido = pedidosTomadosEnvioRapido.length;
>>>>>>> master
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
<<<<<<< HEAD
                        await this.contarPedidosPorEstado(); // Actualizar contadores después de la entrega
=======
>>>>>>> master
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

<<<<<<< HEAD
  filterPedidos() {
    // Aplicar filtro por estado
    this.loadPedidos();
  }



  async takePhotoAndSave(pedidoId: string) {
    try {
      // Captura la foto
      const photo: any = await this.supabaseService.takePicture();
      if (photo) {
        // Genera un nombre único para la foto usando un timestamp
        const timestamp = new Date().getTime();
        const filePath = `photos/fotoEnvio_final-${timestamp}.jpeg`;
  
        // Convertir el Data URL a un Blob
        const blob = await fetch(photo.webPath).then((res) => res.blob());
  
        // Convertir el blob en un archivo
        const file = await this.convertBlobToFile(blob, filePath);
  
        // Subir la foto al bucket de Supabase
        const { error: uploadError } = await this.supabaseService.uploadImage(file, filePath);
        if (uploadError) {
          throw new Error(`Error al subir la foto: ${uploadError.message}`);
        }
  
        // Obtener la URL pública de la foto
        const { publicURL, error: urlError } = await this.supabaseService.getImageUrl(filePath);
        if (urlError) {
          let errorMessage: string;
          if (typeof urlError === 'object' && urlError !== null && 'message' in urlError) {
            errorMessage = (urlError as Error).message;
          } else {
            errorMessage = String(urlError);
          }

          throw new Error(`Error al obtener la URL de la imagen: ${errorMessage}`);
        }
  
        if (!publicURL) {
          throw new Error('URL pública es nula');
        }
  
        // Verificar el publicURL obtenido
        console.log('URL pública generada:', publicURL);
  
        // Actualizar el pedido en la base de datos con la URL de la foto
        const { error: updateError } = await this.supabaseService.updatePedidoFotoEnvio(pedidoId, publicURL);
        if (updateError) {
          throw new Error(`Error al actualizar el pedido: ${updateError.message}`);
        }
  
        // Mostrar notificación de éxito
        await this.showToast('Foto de entrega subida correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al capturar o subir la foto:', error);
      await this.showToast('Error al subir la foto de entrega', 'danger');
    }
  }
  
  
  

 

  private async convertBlobToFile(blob: Blob, fileName: string): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

=======
 


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
  
>>>>>>> master
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }
<<<<<<< HEAD
=======






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
  
  




>>>>>>> master
}






<<<<<<< HEAD
  












=======
  
>>>>>>> master
