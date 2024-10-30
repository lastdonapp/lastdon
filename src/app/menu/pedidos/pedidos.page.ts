// pedidos.page.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
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
  cantidadPaquetesCambio :number = 1;
  valorCambioPedido : number =1000;
  telefonoCambio : string = '';
  cambioRealizado : boolean = true;
  searchTerm: string = '';  // Término de búsqueda
  pedidosFiltrados: any[] = [];
  prefijo : string= '+569';
  prefijoNombreCambio : string ='Cambio';
  isModalOpen: boolean = false;




 

  constructor(private readonly supabaseService: SupabaseService, private readonly toastController: ToastController, private readonly router: Router, private readonly alertController: AlertController
  ) { }

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
        pedido.cambioRealizado = pedido.cambio_realizado ? true : false;
        pedido.mostrarFormulario = false;
      });

      this.pedidosFiltrados = this.pedidos;  // Inicialmente mostrar todos los pedidos

      if (this.pedidos.length === 0) {
        this.showToast('No tienes pedidos actualmente.');
      }
    } catch (error) {
      this.showToast('Error al cargar los pedidos.');
      console.error('Error al cargar los pedidos:', error);
    }
  }

  filtrarPedidos(event: any) {
    const searchTerm = event.target.value.toLowerCase().trim();
    this.pedidosFiltrados = this.pedidos.filter(pedido => 
      pedido && pedido.nombre_pedido && 
      pedido.nombre_pedido.toLowerCase().includes(searchTerm)
    );
    console.log('Pedidos filtrados:', this.pedidosFiltrados);
  }

  // Mostrar el formulario y detener la propagación del evento
  mostrarFormulario(id: string, event: Event) {
    this.isModalOpen = true;
    event.stopPropagation(); // Detener la propagación del evento
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) {
      pedido.mostrarFormulario = true; // Mostrar el formulario
    }
  }

  // Función para cerrar el formulario
  cerrarFormulario(id: string, event: Event) {

    //Cerra Modal
    this.isModalOpen = false;

    const modalEvent = event as CustomEvent;  // Cast to CustomEvent if you expect custom data
    const dismissedData = modalEvent.detail?.data;  // Access any details from the modal event
    // Your logic goes here, for example:
    console.log('Modal dismissed with:', dismissedData);

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
    this.isModalOpen = false;
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
              console.log('Detalles del pedido entregado:', pedidoEntregado); // Añade esta línea
              if (!pedidoEntregado) {
                console.error('No se encontraron los detalles del pedido entregado');
                return;
              }
  
              // Concatenar el prefijo con el número de teléfono al momento de la confirmación
              const TelefonoFinal = this.prefijo + this.telefonoCambio;
  
              // Crear el objeto pedidoCambio con el teléfono concatenado
              const pedidoCambio = {
                nombrePedido: pedidoEntregado.nombre_pedido + this.prefijoNombreCambio,
                descripcionPedido: this.observaciones,
                direccionPedido: this.direccionPedidoCambio,
                direccionEntrega: this.direccionEntregaCambio,
                nombreDestinatario: this.destinatarioCambio,
                numeracionCasa: '1234',
                vivienda: 'Nueva vivienda',
                comuna: pedidoEntregado.comuna,
                telefono: TelefonoFinal, // Aquí usamos el teléfono concatenado
                cantidadPaquetes: this.cantidadPaquetesCambio,
                dimensiones: pedidoEntregado.dimensiones,
                fragil: pedidoEntregado.fragil,
                cambio: true,
                excedeKilos: pedidoEntregado.excede_Kilos,
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
  
               pedido.mostrarFormulario = false;
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
           this.destinatarioCambio  &&
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

      doc.text(`Dirección de Entrega: ${pedido.direccion_entrega}`, 10, currentY);
      currentY += 10;


      doc.text(`Comuna: ${pedido.comuna}`, 10, currentY);
      currentY += 10;


      // Reemplazar true/false por "Sí"/"No"
      const esFragil = pedido.fragil ? 'Sí' : 'No';
      doc.text(`¿Es frágil? ${esFragil}`, 10, currentY);
      currentY += 10;

      // Reemplazar true/false por "Sí"/"No" para el peso
      const excedeKilos = pedido.excede_kilos ? 'Sí' : 'No';
      doc.text(`¿Excede 2,5 kilos? ${excedeKilos}`, 10, currentY);
      currentY += 10; // Incrementar si agregas más texto después



      const cambio = pedido.cambio ? 'Sí' : 'No'; 
      doc.text(`¿Es un Cambio? ${cambio}`, 10, currentY);
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

generarQRValue(pedido: any): string {
  const qrValue = `Valor envío $ : ${pedido.costo}, Origen: ${pedido.direccion_pedido}, Destino: ${pedido.direccion_entrega},
  teléfono: ${pedido.telefono}`;
  return qrValue;
}


// Método para abrir el modal
openModal() {
  this.isModalOpen = true;
}







}




