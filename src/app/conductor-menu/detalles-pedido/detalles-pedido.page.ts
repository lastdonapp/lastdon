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

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private googleMapsService: GoogleMapsService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit() {
    this.loadPedido();
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
    } else {
      console.error('No se pudo encontrar el elemento del mapa.');
    }
  }
}