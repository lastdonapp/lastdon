import { Component, OnInit } from '@angular/core';
import { GoogleMapsService } from '../services/google-maps.service';
import { GeolocationService } from '../services/geolocation.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  pickupAddress: string = 'Verbena 2822, Quilpue'; // Dirección de ejemplo
  deliveryAddress: string = 'hospital Carlos Van Buren, Valparaíso'; // Dirección de ejemplo

  constructor(
    private googleMapsService: GoogleMapsService,
    private geolocationService: GeolocationService
  ) { }


  ngOnInit() {
    this.geolocationService.getCurrentPosition().then(coords => {
      console.log('Ubicación actual:', coords);
      this.initializeMap(coords.latitude, coords.longitude);
  
      this.googleMapsService.addMarker(coords.latitude, coords.longitude, 'Estás aquí');
  
      this.googleMapsService.geocodeAddress(this.pickupAddress).then(pickupCoords => {
        console.log('Coordenadas de recogida:', pickupCoords);
        this.googleMapsService.addMarker(pickupCoords.latitude, pickupCoords.longitude, 'Punto de recogida paquete');
      }).catch(error => {
        console.error('Error al obtener la ubicación de recogida:', error);
      });
  
      this.googleMapsService.geocodeAddress(this.deliveryAddress).then(deliveryCoords => {
        console.log('Coordenadas de entrega:', deliveryCoords);
        this.googleMapsService.addMarker(deliveryCoords.latitude, deliveryCoords.longitude, 'Punto de entrega');
      }).catch(error => {
        console.error('Error al obtener la ubicación de entrega:', error);
      });
  
    }).catch(error => {
      console.error('Error al obtener la ubicación:', error);
      this.initializeMap(37.7749, -122.4194); // San Francisco por defecto
    });
  }

  initializeMap(latitude: number, longitude: number) {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      this.googleMapsService.initMap(mapElement, latitude, longitude);
    } else {
      console.error('No se pudo encontrar el elemento del mapa.');
    }
  }
}