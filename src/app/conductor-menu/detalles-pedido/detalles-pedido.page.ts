import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { GeolocationService } from '../../services/geolocation.service';
import { TrackingService } from 'src/app/services/tracking.service';
import { ToastController } from '@ionic/angular';





@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.page.html',
  styleUrls: ['./detalles-pedido.page.scss'],
})
export class DetallesPedidoPage implements OnInit {
  pedido: any;
  mostrarMapa: boolean = false; // Para mostrar u ocultar el mapa
  currentLocation: { lat: number, lng: number } | undefined; // localización actual del mapa
  botonDeshabilitado: boolean = false;  // Variable para deshabilitar el botón
  userEmail: string = ''; // Email del usuario
  conductorEmail: string = ''; // Email del conductor
  estadoPedido: string ='';
  trackingIniciado: boolean = false; // Indica si el tracking ha sido iniciado
  private watchId: number | undefined; // Almacena el ID de vigilancia de geolocalización
  private trackingId: string = ''; // Asigna el ID del tracking iniciado
  pedidoMarker: any; // Marcador del pedido
  nuevaDirecciónEntrega: string = '';


  constructor(
    private readonly route: ActivatedRoute,
    private readonly supabaseService: SupabaseService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly geolocationService: GeolocationService,
    private readonly toastController: ToastController,
    private readonly trackingService: TrackingService  // Inyecta el TrackingService
  

  ) {}

  async ngOnInit() {
    await this.loadPedido();
    if (this.pedido) {
      await this.obtenerEstadoPedido();
    }
  }








  async loadPedido() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const { data, error } = await this.supabaseService.getPedidoById(id);
        if (error) {
          throw new Error(error.message);
        }
        this.pedido = data;
        this.pedido.dimensiones = JSON.parse(this.pedido.dimensiones);

        // Verificar si el estado es 'entregado'
        if (this.pedido.estado === 'entregado') {
          this.botonDeshabilitado = true;
          this.mostrarMapa = false; // Asegura que el mapa esté cerrado si ya estaba abierto
        }

      } catch (error) {
        console.error('Error al cargar el pedido:', error);
      }
    }
  }

  async obtenerEstadoPedido() {
    try {
      if (this.pedido && this.pedido.id) {
        this.estadoPedido = await this.supabaseService.obtenerEstadoPedido(this.pedido.id);
      } else {
        console.error('ID del pedido no disponible');
      }
    } catch (error) {
      console.error('Error al obtener el estado del pedido:', error);
    }
  }


  async toggleMapa() {
    if (this.pedido.estado !== 'entregado') {
      this.mostrarMapa = !this.mostrarMapa;
      if (this.mostrarMapa) {
        await this.initializeMap();
      }
    }
  }


  async initializeMap() {
    try {
      // Obtener el estado del pedido antes de inicializar el mapa
      const estadoPedido = await this.supabaseService.obtenerEstadoPedido(this.pedido.id);

      // Obtener la ubicación actual
      const coords = await this.geolocationService.getCurrentPosition();
      this.currentLocation = { lat: coords.latitude, lng: coords.longitude };

      // Inicializar el mapa
      const mapElement = document.getElementById('map');
      if (mapElement) {
        this.googleMapsService.initMap(mapElement, this.currentLocation.lat, this.currentLocation.lng);

        // Agregar marcador de ubicación actual
        this.googleMapsService.addMarker(this.currentLocation.lat, this.currentLocation.lng, 'Ubicación Actual');

        // Verificar si el estado es uno de los que requiere ocultar el marcador
        const estadosParaOcultarMarcador = ['recepcionado', 'en centro de distribución', 'reanudado'];
        
        if (!estadosParaOcultarMarcador.includes(estadoPedido)) {
          // Geocodificar y agregar marcador para la dirección del pedido solo si no está en los estados definidos
          this.googleMapsService.geocodeAddress(this.pedido.direccion_pedido).then(pedidoCoords => {
            this.pedidoMarker = this.googleMapsService.addMarker(pedidoCoords.latitude, pedidoCoords.longitude, 'Dirección del Pedido');
          }).catch(error => {
            console.error('Error al obtener la ubicación del pedido:', error);
          });
        }

        // Geocodificar y agregar marcador para la dirección de entrega
        this.googleMapsService.geocodeAddress(this.pedido.direccion_entrega).then(entregaCoords => {
          this.googleMapsService.addMarker(entregaCoords.latitude, entregaCoords.longitude, 'Dirección de Entrega');
        }).catch(error => {
          console.error('Error al obtener la ubicación de entrega:', error);
        });

        // Iniciar la vigilancia de la ubicación actual y el tracking del pedido
        this.watchPosition(this.pedido.id);
      } else {
        console.error('No se pudo encontrar el elemento del mapa.');
      }
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }
  
  private async watchPosition(pedidoId: string) {
    let moveStep = 0.0001;  // Simulación de movimiento pequeño

    // Obtener el trackingId antes de comenzar a seguir la ubicación
    const trackingId = await this.supabaseService.getTrackingById(pedidoId);
    
    if (!trackingId) {
        console.error('');
        return;  // Salir si no hay trackingId
    }

    // Asignar el trackingId si es válido
    this.trackingId = trackingId;

    console.log('Tracking ID obtenido:', this.trackingId);

    this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const newLat = position.coords.latitude + (Math.random() * moveStep - moveStep / 2);
            const newLng = position.coords.longitude + (Math.random() * moveStep - moveStep / 2);

            this.currentLocation = { lat: newLat, lng: newLng };

            // Actualizar el marcador en el mapa
            this.googleMapsService.updateMarker(this.currentLocation.lat, this.currentLocation.lng, 'Ubicación Actual');

            // Actualizar la ubicación del tracking en la base de datos
            try {
                await this.supabaseService.updateTrackingLocation(this.trackingId, this.currentLocation.lat, this.currentLocation.lng);
            } catch (error) {
                console.error('Error al actualizar la ubicación del tracking:', error);
            }
        },
        (error) => {
            console.error('Error al obtener la ubicación en tiempo real:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000
        }
    );
}


  

async iniciarTracking(pedidoId: string) {
  try {
    // Verificar el estado del pedido
    const estadoPedido = await this.supabaseService.obtenerEstadoPedido(pedidoId);
    if (estadoPedido !== 'recepcionado') {
      console.error('El pedido no está en el estado correcto para iniciar el tracking.');
      return;
    }

    // Verificar si el tracking ya ha sido iniciado
    const trackingIniciado = await this.verificarTrackingIniciado(pedidoId);
    if (trackingIniciado) {
      console.warn('El tracking ya ha sido iniciado para este pedido.');
      return;
    }

    // Obtener la ubicación actual del conductor
    const coords = await this.geolocationService.getCurrentPosition();
    const pedidoDetails = await this.supabaseService.obtenerDetallesPedido(pedidoId);
    const conductorEmail = pedidoDetails.conductor;
    const clienteEmail = pedidoDetails.usuario;

    const trackingData = {
      pedido_id: pedidoId,
      conductor_email: conductorEmail,
      cliente_email: clienteEmail,
      latitud: coords.latitude,
      longitud: coords.longitude,
      estado_tracking: 'iniciado'
    };

    // Iniciar tracking y obtener el trackingId
    this.trackingId = await this.supabaseService.iniciarTracking(trackingData);

    console.log('Tracking iniciado con ID:', this.trackingId);

    // Mostrar mensaje de éxito al usuario
    const toast = await this.toastController.create({
      message: 'Tracking iniciado con éxito',
      duration: 2000, // Duración del mensaje en milisegundos
      color: 'success' // Color del mensaje (success, danger, etc.)
    });
    await toast.present();

  } catch (error) {
    console.error('Error al iniciar el tracking:', error);
    
    // Mostrar mensaje de fallo al usuario
    const toast = await this.toastController.create({
      message: 'Error al iniciar el tracking: Operación fallida',
      duration: 2000, // Duración del mensaje en milisegundos
      color: 'danger' // Color del mensaje para fallos
    });
    await toast.present();
  }
}

  



  
  // Método para verificar si el tracking ya ha sido iniciado
async verificarTrackingIniciado(pedidoId: string): Promise<boolean> {
  try {
    const { data, error } = await this.supabaseService.getTrackingByPedidoId(pedidoId);
    if (error) {
      throw error;
    }

    // Verifica si existe al menos un registro con estado 'iniciado'
    return data.length > 0 && data[0].estado_tracking === 'iniciado';
  } catch (error) {
    console.error('Error al verificar el estado del tracking:', error);
    return false; // Asume que el tracking no está iniciado si ocurre un error
  }
}

ngOnDestroy() {
  if (this.watchId !== undefined) {
    navigator.geolocation.clearWatch(this.watchId);
  }
}







}