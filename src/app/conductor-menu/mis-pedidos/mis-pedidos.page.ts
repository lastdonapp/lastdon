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
  usuario: any = this.supabaseService.getCurrentUser();
  capturedPhoto: string = ''; // Variable para almacenar la URL de la foto capturada 
  photoUrl: string = ''; // URL de la foto del pedido

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

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }
}






  












