import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, interval } from 'rxjs';
import { GeolocationService } from './geolocation.service';
import { SupabaseService } from './supabase.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TrackingService implements OnDestroy {
  private trackingId: string = '';
  private readonly currentLocationSubject = new BehaviorSubject<{ lat: number, lng: number }>({ lat: 0, lng: 0 });
  public readonly currentLocation$ = this.currentLocationSubject.asObservable();
  private trackingInterval: any;
  private trackingStateSubscription!: Subscription;

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
      this.monitorTrackingStatus();
    }
  }

  async iniciarTracking(pedidoId: string) {
    try {
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

      if (!this.trackingId) {
        console.error('Error al iniciar el tracking: no se ha generado un tracking ID.');
        return;
      }

      console.log('Tracking iniciado con ID:', this.trackingId);

      localStorage.setItem('trackingId', this.trackingId);
      this.startTrackingUpdates(this.trackingId);
      this.monitorTrackingStatus();

    } catch (error) {
      console.error('Error al iniciar el tracking:', error);
      const toast = await this.toastController.create({
        message: 'Error al iniciar el tracking: Operación fallida',
        duration: 10000,
        color: 'danger'
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

    this.geolocationService.watchPosition(async (coords) => {
      try {
        const estadoTracking = await this.supabaseService.obtenerEstadoTrackingById(trackingId);

        if (estadoTracking === 'finalizado' || estadoTracking === 'En pausa') {
          console.log('El tracking ha sido finalizado o pausado, deteniendo el tracking.');
          this.stopTrackingUpdates(estadoTracking === 'finalizado');
          return;
        }

        const newLat = coords.latitude;
        const newLng = coords.longitude;

        await this.supabaseService.updateTrackingLocation(trackingId, newLat, newLng);
        console.log('Tracking actualizado automáticamente:', newLat, newLng);
      } catch (error) {
        console.error('Error al actualizar la ubicación del tracking:', error);
      }
    });
  }

  // Método para detener la actualización de tracking
  stopTrackingUpdates(finalizado: boolean = false) {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
      console.log('Actualización de tracking detenida.');
    }
    
    if (finalizado) {
      localStorage.removeItem('trackingId');
      this.trackingId = ''; // Limpiar el trackingId en la clase
      console.log('Tracking ID eliminado de localStorage debido a finalización.');
    }
  }

  // Monitorea el estado del tracking para pausar o reanudar la actualización
  private monitorTrackingStatus() {
    this.trackingStateSubscription = interval(10000).subscribe(async () => {
      if (!this.trackingId) {
        console.warn("trackingId está vacío o no ha sido asignado, omitiendo la verificación de estado.");
        return;
      }
      
      try {
        const estadoTracking = await this.supabaseService.obtenerEstadoTrackingById(this.trackingId);
        
        if (estadoTracking === 'finalizado') {
          console.log('El tracking ha sido finalizado, deteniendo completamente el tracking.');
          this.stopTrackingUpdates(true);
        } else if (estadoTracking === 'En pausa') {
          console.log('El tracking está en pausa, deteniendo actualizaciones temporalmente.');
          this.stopTrackingUpdates(false);
        } else if (estadoTracking === 'reanudado') {
          console.log('Tracking reanudado, reiniciando actualizaciones de ubicación.');
          this.startTrackingUpdates(this.trackingId);
        }
      } catch (error) {
        console.error('Error al verificar el estado del tracking:', error);
      }
    });
  }

  // Método para limpiar suscripciones al destruir el servicio
  ngOnDestroy() {
    if (this.trackingStateSubscription) {
      this.trackingStateSubscription.unsubscribe();
    }
  }
}
