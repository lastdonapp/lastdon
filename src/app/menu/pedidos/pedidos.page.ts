// pedidos.page.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { jsPDF } from 'jspdf';  // Importar jsPDF para el PDF
import html2canvas from 'html2canvas'; // Para convertir la parte visual a un PDF




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
  direccionPedidoCambio :string = '';
  direccionEntregaCambio :string = '';
  destinatarioCambio :string = '';
  cantidadPaquetesCambio :number = 0;
  valorCambioPedido : number =1000;
  telefonoCambio : string = '';
  cambioRealizado : boolean = true;
 

  constructor(private supabaseService: SupabaseService, private toastController: ToastController, private router: Router, private alertController: AlertController) { }

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
  
        // Consultar si el cambio ya fue realizado (boolean de la base de datos)
        if (pedido.cambio_realizado) {
          // Si cambio_realizado es true, deshabilitar el botón para este pedido
          pedido.cambioRealizado = true;
        } else {
          pedido.cambioRealizado = false;
        }
  
        pedido.mostrarFormulario = false; // Agregar propiedad para mostrar el formulario de cambios si aplica
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


  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }


  generateUniqueCode() {
    return 'PED-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }




  async generarNuevoPedidoDesdeEntregado(pedidoId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar cambio',
      message: '¿Está seguro de querer generar el cambio de pedido?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cambio de pedido cancelado');
          }
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              const pedidoEntregado = await this.supabaseService.obtenerDetallesPedidoEntregado(pedidoId);
              if (!pedidoEntregado) {
                console.error('No se encontraron los detalles del pedido entregado');
                return;
              }
  
              const pedidoCambio = {
                nombrePedido: pedidoEntregado.nombre_pedido,
                descripcionPedido: this.observaciones,
                direccionPedido: this.direccionPedidoCambio,
                direccionEntrega: this.direccionEntregaCambio,
                nombreDestinatario: this.destinatarioCambio,
                numeracionCasa: '1234',
                vivienda: 'Nueva vivienda',
                comuna: pedidoEntregado.comuna,
                telefono: this.telefonoCambio,
                cantidadPaquetes: this.cantidadPaquetesCambio,
                dimensiones: pedidoEntregado.dimensiones,
                fragil: pedidoEntregado.fragil,
                cambio: true,
                excedeKilos: false,
                fecha: new Date().toISOString(),
                costoTotal: this.valorCambioPedido,
                estado: 'por tomar',
                fechaTomado: null,
                conductor: '',
                usuario: this.usuario.email,
                codigo: this.generateUniqueCode(),
                image_url: pedidoEntregado.image_url,
                pagado: false
              };
  
              const resultado = await this.supabaseService.addPedido(pedidoCambio);
  
              if (resultado.error) {
                console.error('Error al agregar el nuevo pedido:', resultado.error);
              } else {
                console.log('Nuevo pedido agregado con éxito');
                this.showToast('El nuevo pedido ha sido agregado exitosamente.');
  
                // Actualizar el campo 'cambio_realizado' en la base de datos para el pedido original
                await this.supabaseService.actualizarCambioRealizado(pedidoId, true);
  
                // Marcar localmente el pedido como cambiado para deshabilitar el botón
                const pedido = this.pedidos.find(p => p.id === pedidoId);
                if (pedido) {
                  pedido.cambioRealizado = true;
                }
                // evitamos que sigua utilizando el formulario para hacer cambios
                this.router.navigate(['menu/detalles-pedido']);


              }
  
            } catch (error) {
              console.error('Error al generar un nuevo pedido desde el entregado:', error);
              this.showToast('Error al generar el nuevo pedido.');
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  isFormValid() {
    return this.observaciones && this.direccionPedidoCambio && this.direccionEntregaCambio &&
           this.destinatarioCambio && this.cantidadPaquetesCambio >= 1 &&
           this.telefonoCambio && this.telefonoCambio.length === 8;
  }

 // Función para generar el PDF con la etiqueta y el código QR
generarEtiquetaPDF(pedido: any) {
  const doc = new jsPDF();

  // Seleccionar el elemento QR generado dinámicamente
  const qrElementId = `qrCode-${pedido.id}`;
  const qrElement = document.getElementById(qrElementId);

  if (qrElement) {
    // Convertir la sección que contiene el QR a imagen
    html2canvas(qrElement).then(canvas => {
      const qrImage = canvas.toDataURL('image/png');

      // Agregar detalles del pedido al PDF
      let currentY = 30; // Posición inicial en Y

      doc.text(`Remitente: ${pedido.nombre_destinatario}`, 10, currentY);
      currentY += 10; // Incrementar la posición para la siguiente línea

      doc.text(`Dirección de Pedido: ${pedido.direccion_pedido}`, 10, currentY);
      currentY += 10;

      doc.text(`Dirección de Entrega: ${pedido.direccion_entrega}`, 10, currentY);
      currentY += 10;

      doc.text(`Teléfono: ${pedido.telefono}`, 10, currentY);
      currentY += 10;

      doc.text(`Costo del envío en CLP $: ${pedido.costo}`, 10, currentY);
      currentY += 10;

      // Reemplazar true/false por "Sí"/"No"
      const esFragil = pedido.fragil ? 'Sí' : 'No';
      doc.text(`¿Es frágil? ${esFragil}`, 10, currentY);
      currentY += 10;

      // Reemplazar true/false por "Sí"/"No" para el peso
      const excedeKilos = pedido.excede_kilos ? 'Sí' : 'No';
      doc.text(`¿Excede 2,5 kilos? ${excedeKilos}`, 10, currentY);
      currentY += 10; // Incrementar si agregas más texto después

      // Añadir el código QR al PDF
      const qrWidth = canvas.width;
      const qrHeight = canvas.height;

      // Calcular el tamaño a mantener
      const aspectRatio = qrWidth / qrHeight;
      const newWidth = 100; // Establece el ancho deseado
      const newHeight = newWidth / aspectRatio; // Mantener la relación de aspecto

      doc.addImage(qrImage, 'PNG', 10, currentY, newWidth, newHeight);

      // Descargar el PDF
      doc.save(`etiqueta_pedido_${pedido.id}.pdf`);
    }).catch(error => {
      console.error('Error generando la imagen del código QR:', error);
    });
  } else {
    console.error('No se pudo encontrar el elemento QR para el pedido:', pedido.id);
  }
}
}




