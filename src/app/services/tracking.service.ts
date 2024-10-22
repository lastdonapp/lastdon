import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { GeolocationService } from './geolocation.service'; // Asegurarse de tener este servicio
import { SupabaseService } from './supabase.service'; // El servicio que maneja la logica con Supabase

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  private  trackingId: string = '';
  private  readonly currentLocationSubject = new BehaviorSubject<{ lat: number, lng: number }>({lat :0, lng: 0});
  public readonly currentLocation$ = this.currentLocationSubject.asObservable();
  private  trackingInterval: any;

  constructor(
    private  readonly geolocationService: GeolocationService,
    private readonly supabaseService: SupabaseService
  ) {}

  async iniciarTracking(pedidoId: string) {
    const estadoPedido = await this.supabaseService.obtenerEstadoPedido(pedidoId);
    if (estadoPedido !== 'recepcionado') {
      console.error('El pedido no está en el estado correcto para iniciar el tracking.');
      return;
    }

    const trackingIniciado = await this.supabaseService.verificarTrackingIniciado(pedidoId);
    if (trackingIniciado) {
      console.warn('El tracking ya ha sido iniciado para este pedido.');
      return;
    }

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

    this.trackingId = await this.supabaseService.iniciarTracking(trackingData);
    console.log('Tracking iniciado con ID:', this.trackingId);

    // Inicia la actualización automática
    this.startTrackingUpdates();
  }

  private startTrackingUpdates() {
    const trackingFrequency = 10000; // Frecuencia de actualización en milisegundos

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    this.trackingInterval = setInterval(async () => {
      const position = await this.geolocationService.getCurrentPosition();
      const newLat = position.latitude;
      const newLng = position.longitude;

      // Actualizar el tracking en Supabase
      await this.supabaseService.updateTrackingLocation(this.trackingId, newLat, newLng);

      // Emitir nueva ubicación
      this.currentLocationSubject.next({ lat: newLat, lng: newLng });

      console.log('Tracking actualizado automáticamente:', newLat, newLng);
    }, trackingFrequency);
  }

  stopTrackingUpdates() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }
}
