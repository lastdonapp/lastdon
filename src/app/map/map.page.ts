import { Component, OnInit,AfterViewInit } from '@angular/core';
import { GoogleMapsService } from '../services/google-maps.service';
import { GeolocationService } from '../services/geolocation.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  constructor(private googleMapsService: GoogleMapsService, private geolocationService: GeolocationService) { }

  ngOnInit() {
    this.geolocationService.getCurrentPosition().then(coords => {
      console.log('Ubicación actual:', coords);
      this.initializeMap(coords.latitude, coords.longitude);
    }).catch(error => {
      console.error('Error al obtener la ubicación:', error);
      // Manejo del error: puedes inicializar el mapa en una ubicación predeterminada o mostrar un mensaje al usuario.
      this.initializeMap(37.7749, -122.4194); // Ubicación predeterminada (San Francisco)
    });
  }

  initializeMap(latitude: number, longitude: number) {
    const mapElement = document.getElementById('map'); // Asegúrate de que el ID coincida con el de tu elemento HTML
    if (mapElement) {
      this.googleMapsService.initMap(mapElement, latitude, longitude);
    } else {
      console.error('No se pudo encontrar el elemento del mapa.');
    }
  }
}



