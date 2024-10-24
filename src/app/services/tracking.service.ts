import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeolocationService } from './geolocation.service';
import { SupabaseService } from './supabase.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private trackingId: string = '';
  private readonly currentLocationSubject = new BehaviorSubject<{ lat: number, lng: number }>({ lat: 0, lng: 0 });
  public readonly currentLocation$ = this.currentLocationSubject.asObservable();
  private trackingInterval: any;

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly supabaseService: SupabaseService,
    private readonly toastController: ToastController
  ) {
    this.reiniciarTrackingSiEsNecesario();
  }

  // Método para verificar si hay un tracking activo tras un refresh
  private reiniciarTrackingSiEsNecesario() {
    const storedTrackingId = localStorage.getItem('trackingId');
    if (storedTrackingId) {
      console.log('Reiniciando tracking con ID desde localStorage:', storedTrackingId);
      this.trackingId = storedTrackingId;
      this.startTrackingUpdates(this.trackingId);
    }
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
      const trackingIniciado = await this.supabaseService.verificarTrackingIniciado(pedidoId);
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

      if (!this.trackingId) {
        console.error('Error al iniciar el tracking: no se ha generado un tracking ID.');
        return;
      }

      console.log('Tracking iniciado con ID:', this.trackingId);

      // Guardar el trackingId en localStorage para mantener persistencia
      localStorage.setItem('trackingId', this.trackingId);

      // Inicia la actualización automática con el trackingId
      this.startTrackingUpdates(this.trackingId);
      console.log(this.trackingId, 'id al momento de utilizar la actualización');

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

  // Método para iniciar la actualización de tracking
  private startTrackingUpdates(trackingId: string) {
    if (!trackingId) {
      console.error('No se puede iniciar la actualización automática: trackingId no válido.');
      return;
    }

    // Escuchar cambios en la ubicación en tiempo real
    this.geolocationService.watchPosition(async (coords) => {
      try {
        // Obtener el estado del tracking usando el trackingId
        const estadoTracking = await this.supabaseService.obtenerEstadoTrackingById(trackingId);
        console.log(this.trackingId, 'Id al momento de entregar el argumento a la función obtener');

        // Detener el tracking si el estado es 'finalizado'
        if (estadoTracking === 'finalizado') {
          console.log('El tracking ha sido finalizado, deteniendo el tracking.');
          this.stopTrackingUpdates();
          return;
        }

        const newLat = coords.latitude;
        const newLng = coords.longitude;

        // Actualizar el tracking en Supabase
        await this.supabaseService.updateTrackingLocation(trackingId, newLat, newLng);

        console.log('Tracking actualizado automáticamente:', newLat, newLng);
      } catch (error) {
        console.error('Error al actualizar la ubicación del tracking:', error);
        console.log(coords.latitude, coords.longitude);
      }
    });
  }

  // Método para detener la actualización de tracking
  stopTrackingUpdates() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
      console.log('Actualización de tracking detenida.');
    }
    
    // Limpiar localStorage cuando se detiene el tracking
    localStorage.removeItem('trackingId');
  }
}
