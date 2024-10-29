import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { GoogleMapsService } from '../../services/google-maps.service';
import { GeolocationService } from '../../services/geolocation.service';




@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.page.html',
  styleUrls: ['./detalles-pedido.page.scss'],
})
export class DetallesPedidoPage implements OnInit, OnDestroy {
  pedido: any;
  mostrarMapa: boolean = false; // Para mostrar u ocultar el mapa
  currentLocation: { lat: number, lng: number } | undefined; // localización actual del mapa
  botonDeshabilitado: boolean = false;  // Variable para deshabilitar el botón
  userEmail: string = ''; // Email del usuario
  conductorEmail: string = ''; // Email del conductor
  estadoPedido: string ='';
  trackingIniciado: boolean = false; // Indica si el tracking ha sido iniciado
  private watchId: number | undefined; // Almacena el ID de vigilancia de geolocalización
  pedidoMarker: any; // Marcador del pedido
  nuevaDirecciónEntrega: string = '';


  constructor(
    private readonly route: ActivatedRoute,
    private readonly supabaseService: SupabaseService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly geolocationService: GeolocationService,

  

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
      // Obtener la ubicación actual
      const coords = await this.geolocationService.getCurrentPosition();
      this.currentLocation = { lat: coords.latitude, lng: coords.longitude };
  
      // Inicializar el mapa
      const mapElement = document.getElementById('map');
      if (mapElement) {
        this.googleMapsService.initMap(mapElement, this.currentLocation.lat, this.currentLocation.lng);
  
        // Agregar marcador de ubicación actual
        this.googleMapsService.addMarker(this.currentLocation.lat, this.currentLocation.lng, 'Ubicación Actual');
  
        // Geocodificar y agregar marcador para la dirección del pedido
        this.googleMapsService.geocodeAddress(this.pedido.direccion_pedido).then(pedidoCoords => {
          this.pedidoMarker = this.googleMapsService.addMarker(pedidoCoords.latitude, pedidoCoords.longitude, 'Dirección del Pedido');
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
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }
  
  
  private async watchPosition() {
    // Iniciar la vigilancia de la ubicación actual sin tracking
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Utilizar las coordenadas reales
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
  
        this.currentLocation = { lat: newLat, lng: newLng };
  
        // Actualizar el marcador en el mapa
        this.googleMapsService.updateMarker(this.currentLocation.lat, this.currentLocation.lng, 'Ubicación Actual');
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
  
  



ngOnDestroy() {
  if (this.watchId !== undefined) {
    navigator.geolocation.clearWatch(this.watchId);
  }
}




}