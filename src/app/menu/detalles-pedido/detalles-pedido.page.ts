import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.page.html',
  styleUrls: ['./detalles-pedido.page.scss'],
})
export class DetallesPedidoPage implements OnInit {
  pedido: any;
  mostrarMapa: boolean = false; // Controla la visibilidad del mapa
  ubicacionPaquete: { lat: number, lng: number } | undefined; // Guarda la ubicación del conductor
  trackingActivo: boolean = false; // Indica si el tracking está activo

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private googleMapsService: GoogleMapsService
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

        // Verificar el estado del tracking del pedido
        await this.verificarTrackingActivo();
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
      }
    }
  }


  
  async verificarTrackingActivo() {
    if (this.pedido && this.pedido.id) {
      try {
        const trackingData = await this.supabaseService.getTracking(this.pedido.id);
        if (trackingData && trackingData.length > 0) {
          // Verificar si el estado del tracking es 'iniciado'
          if (trackingData[0].estado_tracking === 'iniciado') {
            this.trackingActivo = true;
          } else if (trackingData[0].estado_tracking === 'finalizado') {
            this.trackingActivo = false;
            this.mostrarMapa = false; // Ocultar el mapa si el tracking ha finalizado
          }
        }
      } catch (error) {
        console.error('Error al verificar el estado del tracking:', error);
      }
    }
  }

  // Función para mostrar el mapa con la ubicación del conductor
  async mostrarUbicacionConductor() {
    if (this.trackingActivo && this.pedido) {
      try {
        const trackingData = await this.supabaseService.getTracking(this.pedido.id);
        if (trackingData && trackingData.length > 0) {
          this.ubicacionPaquete = {
            lat: trackingData[0].latitud,
            lng: trackingData[0].longitud,
          };
          this.mostrarMapa = true;
          this.inicializarMapa();
        }
      } catch (error) {
        console.error('Error al obtener la ubicación del conductor:', error);
      }
    }
  }

  inicializarMapa() {
    const mapElement = document.getElementById('map');
    if (mapElement && this.ubicacionPaquete) {
      this.googleMapsService.initMap(mapElement, this.ubicacionPaquete.lat, this.ubicacionPaquete.lng);
      this.googleMapsService.addMarker(this.ubicacionPaquete.lat, this.ubicacionPaquete.lng, 'Ubicación del paquete');
    } else {
      console.error('No se pudo inicializar el mapa o no hay ubicación del paquete');
    }
  }



}



