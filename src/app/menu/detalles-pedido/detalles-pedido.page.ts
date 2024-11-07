import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.page.html',
  styleUrls: ['./detalles-pedido.page.scss'],
})
export class DetallesPedidoPage implements OnInit, OnDestroy {
  pedido: any;
  mostrarMapa: boolean = false; // Controla la visibilidad del mapa
  ubicacionPaquete: { lat: number, lng: number } | undefined; // Guarda la ubicación del conductor
  trackingActivo: boolean = false; // Indica si el tracking está activo
  intervaloTracking: any; // Variable para almacenar el intervalo
 private pedidosUpdateSubscription: any; // Suscripción para actualizaciones de pedidos
  

  constructor(
    private readonly route: ActivatedRoute,
    private readonly supabaseService: SupabaseService,
    private readonly googleMapsService: GoogleMapsService
  ) {}

  ngOnInit() {
    this.loadPedido();
    this.verificarTrackingActivo();
    this.suscribirseAPedidosUpdates();
  }

  ngOnDestroy() {
    // Detener la consulta periódica cuando se destruya el componente
    this.detenerConsultaPeriodica();
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
          const estadoTracking = trackingData[0].estado_tracking;
          
          if (estadoTracking === 'iniciado' || estadoTracking === 'reanudado') {
            this.trackingActivo = true;
            this.iniciarConsultaPeriodica(); // Iniciar la consulta periódica
          } else {
            this.trackingActivo = false;
            this.mostrarMapa = false;
            this.detenerConsultaPeriodica(); // Detener la consulta periódica si el tracking está finalizado o en pausa
            if (estadoTracking === 'En pausa' || estadoTracking === 'finalizado') {
              console.log('El tracking está en pausa o su paquete ya se ha entregado. No se está realizando seguimiento activo.');
            }
          }
        }
      } catch (error) {
        console.error('Error al verificar el estado del tracking:', error);
      }
    }
  }

 // Función para iniciar la consulta periódica de tracking
iniciarConsultaPeriodica() {
  this.detenerConsultaPeriodica(); // Asegurarse de que no haya otro intervalo corriendo

  this.intervaloTracking = setInterval(async () => {
    if (this.trackingActivo && this.pedido) {
      try {
        const trackingData = await this.supabaseService.getTracking(this.pedido.id);
        if (trackingData && trackingData.length > 0) {
          const estadoTracking = trackingData[0].estado_tracking;

          // Si el tracking está finalizado, detener la consulta periódica
          if (estadoTracking === 'finalizado') {
            console.log('El tracking ha finalizado. Deteniendo la consulta periódica.');
            this.detenerConsultaPeriodica();
            this.mostrarMapa = false; // Opcionalmente, puedes ocultar el mapa
          } else {
            this.ubicacionPaquete = {
              lat: trackingData[0].latitud,
              lng: trackingData[0].longitud,
            };
            this.actualizarMapa(); // Actualizar el mapa con la nueva ubicación
            console.log(this.ubicacionPaquete, 'ubicacionPaquete');
          }
        }
      } catch (error) {
        console.error('Error al obtener la ubicación del conductor:', error);
      }
    }
  }, 10000); // Consultar cada 10 segundos (ajusta el intervalo si es necesario)
}

  // Función para detener la consulta periódica
  detenerConsultaPeriodica() {
    if (this.intervaloTracking) {
      clearInterval(this.intervaloTracking);
      this.intervaloTracking = null;
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

  // Función para inicializar el mapa
  inicializarMapa() {
    const mapElement = document.getElementById('map');
    if (mapElement && this.ubicacionPaquete) {
      this.googleMapsService.initMap(mapElement, this.ubicacionPaquete.lat, this.ubicacionPaquete.lng);
      this.googleMapsService.addMarker(this.ubicacionPaquete.lat, this.ubicacionPaquete.lng, 'Ubicación del paquete');
    } else {
      console.error('No se pudo inicializar el mapa o no hay ubicación del paquete');
    }
  }

  actualizarMapa() {
    if (this.mostrarMapa && this.ubicacionPaquete) {
      // Supongamos que el tercer argumento es un título o descripción del marcador
      const markerTitle = 'Ubicación del paquete'; // Título del marcador, ajusta según sea necesario
      this.googleMapsService.updateMarker(this.ubicacionPaquete.lat, this.ubicacionPaquete.lng, markerTitle);
    }
  }





    // Función que maneja la suscripción a las actualizaciones de pedidos
    suscribirseAPedidosUpdates() {
      this.pedidosUpdateSubscription = this.supabaseService.subscribeToPedidosUpdates((updatedPedido) => {
        // Aquí puedes actualizar los datos del pedido en tiempo real
        if (updatedPedido.id === this.pedido.id) {
          this.pedido = updatedPedido;
          console.log('Pedido actualizado en tiempo real:', this.pedido);
          this.verificarTrackingActivo(); // Verificar el estado del tracking en caso de actualización
        }
      });
    }
}

