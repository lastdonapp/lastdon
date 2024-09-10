import { Injectable } from '@angular/core';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  map: any;
  markers: any[] = [];

  constructor() { }




   // Método para inicializar el mapa
   initMap(mapElement: HTMLElement, lat: number, lng: number): void {
    const mapOptions = {
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
}






