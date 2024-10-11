// pedidos.page.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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
  cambioRealizado : boolean = false;

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
    // Mostrar el alert para confirmar
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
              // Paso 1: Obtener los detalles del pedido entregado
              const pedidoEntregado = await this.supabaseService.obtenerDetallesPedidoEntregado(pedidoId);
  
              if (!pedidoEntregado) {
                console.error('No se encontraron los detalles del pedido entregado');
                return;
              }
  
              // Paso 2: Crear el nuevo pedido utilizando los datos obtenidos
              const pedidoCambio = {
                nombrePedido: pedidoEntregado.nombre_pedido,
                descripcionPedido: this.observaciones,
                direccionPedido: this.direccionPedidoCambio,
                direccionEntrega: this.direccionEntregaCambio,
                nombreDestinatario: this.destinatarioCambio,
                numeracionCasa: '1234', // Cambia esto según lo que necesites
                vivienda: 'Nueva vivienda', // Cambia esto según lo que necesites
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
  
              // Paso 3: Llamar a addPedido con el nuevo objeto
              const resultado = await this.supabaseService.addPedido(pedidoCambio);
  
              if (resultado.error) {
                console.error('Error al agregar el nuevo pedido:', resultado.error);
              } else {
                console.log('Nuevo pedido agregado con éxito');
                this.showToast('El nuevo pedido ha sido agregado exitosamente.');
  
                // Deshabilitar el botón de cambio estableciendo la propiedad cambioRealizado a true
                this.cambioRealizado = true;
              }
  
            } catch (error) {
              console.error('Error al generar un nuevo pedido desde el entregado:', error);
              this.showToast('Error al generar el nuevo pedido.');
            }
          }
        }
      ]
    });
  
    // Mostrar el alert
    await alert.present();
  }
  
  isFormValid() {
    return this.observaciones && this.direccionPedidoCambio && this.direccionEntregaCambio &&
           this.destinatarioCambio && this.cantidadPaquetesCambio >= 1 &&
           this.telefonoCambio && this.telefonoCambio.length === 8;
  }
  
  




}