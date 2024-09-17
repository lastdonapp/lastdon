import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { GeolocationService } from '../../services/geolocation.service';


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


  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private googleMapsService: GoogleMapsService,
    private geolocationService: GeolocationService
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
    // Obtenemos la ubicación actual
    const coords = await this.geolocationService.getCurrentPosition();
    this.currentLocation = { lat: coords.latitude, lng: coords.longitude };
  
    // Inicializamos el mapa solo si hay un elemento de mapa disponible
    const mapElement = document.getElementById('map');
    if (mapElement) {
      this.googleMapsService.initMap(mapElement, this.currentLocation.lat, this.currentLocation.lng);
  
      // Agregar marcador para la ubicación actual
      this.googleMapsService.addMarker(this.currentLocation.lat, this.currentLocation.lng, 'Ubicación Actual');
  
      // Geocodificar y agregar marcador para la dirección del pedido
      this.googleMapsService.geocodeAddress(this.pedido.direccion_pedido).then(pedidoCoords => {
        this.googleMapsService.addMarker(pedidoCoords.latitude, pedidoCoords.longitude, 'Dirección del Pedido');
      }).catch(error => {
        console.error('Error al obtener la ubicación del pedido:', error);
      });
  
      // Geocodificar y agregar marcador para la dirección de entrega
      this.googleMapsService.geocodeAddress(this.pedido.direccion_entrega).then(entregaCoords => {
        this.googleMapsService.addMarker(entregaCoords.latitude, entregaCoords.longitude, 'Dirección de Entrega');
      }).catch(error => {
        console.error('Error al obtener la ubicación de entrega:', error);
      });
  
      // Iniciar la vigilancia de la ubicación actual
      this.watchPosition();
    } else {
      console.error('No se pudo encontrar el elemento del mapa.');
    }
  }
  
  private watchPosition() {
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        this.currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };

        // Actualizar el marcador en el mapa
        this.googleMapsService.updateMarker(this.currentLocation.lat, this.currentLocation.lng, 'Ubicación Actual');

        // Actualizar la ubicación del tracking en la base de datos
        if (this.trackingId) {
          try {
            await this.supabaseService.updateTrackingLocation(this.trackingId, this.currentLocation.lat, this.currentLocation.lng);
          } catch (error) {
            console.error('Error al actualizar la ubicación del tracking:', error);
          }
        }
      },
      (error) => {
        console.error('Error al obtener la ubicación en tiempo real:', error);
      },
      {
        enableHighAccuracy: true, // Puedes ajustar las opciones según sea necesario
        timeout: 20000, // Tiempo máximo en milisegundos para obtener la ubicación
        maximumAge: 1000 // Tiempo máximo en milisegundos para considerar la ubicación en caché
      }
    );
  }

  async iniciarTracking(pedidoId: string) {
    try {
      // Verificar el estado del pedido
      const estadoPedido = await this.supabaseService.obtenerEstadoPedido(pedidoId);
      console.log('ID del pedido:', this.pedido.id);
  
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
      
      // Obtener correos del conductor y cliente desde los detalles del pedido
      const conductorEmail = this.conductorEmail; // Asegúrate de que estas propiedades están definidas
      const clienteEmail = this.userEmail;
  
      const trackingData = {
        pedido_id: pedidoId,
        conductor_email: conductorEmail,
        cliente_email: clienteEmail,
        latitud: coords.latitude,
        longitud: coords.longitude,
        estado_tracking: 'iniciado'
      };
  
      // Llamada al servicio Supabase para crear el registro en la tabla tracking
      await this.supabaseService.iniciarTracking(trackingData);
      
      console.log('Tracking iniciado con éxito', trackingData);
    } catch (error) {
      console.error('Error al iniciar el tracking:', error);
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