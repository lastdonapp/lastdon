/// <reference types="google.maps" />
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  map: google.maps.Map | undefined;
  markers: google.maps.Marker[] = [];

  constructor() { }

  // Método para inicializar el mapa
  initMap(mapElement: HTMLElement, lat: number, lng: number): void {
    const mapOptions: google.maps.MapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(mapElement, mapOptions);
  }

  // Método para agregar un marcador
  addMarker(lat: number, lng: number, title?: string): void {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      title: title || '',
    });

    this.markers.push(marker);
  }

  // Método para eliminar todos los marcadores
  clearMarkers(): void {
    for (let marker of this.markers) {
      marker.setMap(null);
    }
    this.markers = [];
  }
 // geocoder API
  geocodeAddress(address: string): Promise<{latitude: number, longitude: number}> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          resolve({ latitude: lat, longitude: lng });
        } else {
          reject('No se pudo obtener la ubicación: ' + status);
        }
      });
    });
  }


}