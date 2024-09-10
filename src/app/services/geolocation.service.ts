import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {






  constructor() { }

  // Método para obtener la ubicación actual
  async getCurrentPosition(): Promise<{latitude: number, longitude: number}> {
    try {
      const position = await Geolocation.getCurrentPosition();
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      return coords;
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      throw error;
    }
  }

  // Método para ver la latitud y longitud en tiempo real
  watchPosition(callback: (coords: {latitude: number, longitude: number}) => void) {
    Geolocation.watchPosition({}, (position, err) => {
      if (position) {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        callback(coords);
      } else {
        console.error('Error en la geolocalización:', err);
      }
    });
  }
}






