import { Component, OnInit } from '@angular/core';
import { GoogleMapsService } from '../services/google-maps.service';
import { GeolocationService } from '../services/geolocation.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  pickupAddress: string = 'Dirección de recogida'; // Dirección de ejemplo
  deliveryAddress: string = 'Dirección de entrega'; // Dirección de ejemplo

  constructor(
    private googleMapsService: GoogleMapsService,
    private geolocationService: GeolocationService
  ) { }

  ngOnInit() {
    // Obtén la ubicación actual
    this.geolocationService.getCurrentPosition().then(coords => {
      console.log('Ubicación actual:', coords);
      
      // Inicializa el mapa en la ubicación actual
      this.initializeMap(coords.latitude, coords.longitude);
  
      // Agrega un marcador en la ubicación actual
      this.googleMapsService.addMarker(coords.latitude, coords.longitude, 'Mi ubicación actual');
  
      // Geocodifica la dirección de recogida
      this.googleMapsService.geocodeAddress(this.pickupAddress).then(pickupCoords => {
        console.log('Coordenadas de recogida:', pickupCoords);
        // Agrega un marcador en el punto de recogida
        this.googleMapsService.addMarker(pickupCoords.latitude, pickupCoords.longitude, 'Recogida');
      }).catch(error => {
        console.error('Error al obtener la ubicación de recogida:', error);
      });
  
      // Geocodifica la dirección de entrega
      this.googleMapsService.geocodeAddress(this.deliveryAddress).then(deliveryCoords => {
        console.log('Coordenadas de entrega:', deliveryCoords);
        // Agrega un marcador en el punto de entrega
        this.googleMapsService.addMarker(deliveryCoords.latitude, deliveryCoords.longitude, 'Entrega');
      }).catch(error => {
        console.error('Error al obtener la ubicación de entrega:', error);
      });
  
    }).catch(error => {
      console.error('Error al obtener la ubicación:', error);
      // En caso de error, inicializa el mapa con una ubicación predeterminada
      this.initializeMap(37.7749, -122.4194); // San Francisco por defecto
    });
  }
  // Método para inicializar el mapa
  initializeMap(latitude: number, longitude: number) {
    const mapElement = document.getElementById('map'); // Asegúrate de que el ID coincide con tu elemento HTML

    if (mapElement) {
      // Inicializa el mapa con las coordenadas obtenidas
      this.googleMapsService.initMap(mapElement, latitude, longitude);
    } else {
      console.error('No se pudo encontrar el elemento del mapa.');
    }
  }
}