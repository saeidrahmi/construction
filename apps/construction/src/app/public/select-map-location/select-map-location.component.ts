import { StorageService } from './../../services/storage.service';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-select-map-location',
  templateUrl: './select-map-location.component.html',
  styleUrls: ['./select-map-location.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ApiServerErrorComponent,
    RouterLink,
    RouterModule,
    SpinnerComponent,
  ],
})
export class SelectMapLocationComponent {
  @ViewChild('mapContainer', { static: false }) gmap: ElementRef;
  lat: number;
  lng: number;
  MIN_ZOOM = 1;
  MAX_ZOOM = 100;
  RADIUS = 1000;
  mapZoom = 15;
  map!: google.maps.Map;
  EARTH_RADIUS_IN_MILES = 3956.0;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  citiesCovered: string[] = [];
  circleOptions: google.maps.CircleOptions;
  circle: google.maps.Circle;
  storageService = inject(StorageService);

  constructor() {
    this.getCurrentLocation();
  }
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }
  onSliderChange() {
    this.circle.setRadius(this.RADIUS);
    const bounds = this.circle.getBounds();
    if (bounds) {
      this.map.fitBounds(bounds);
    }
  }
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.lat = this.center.lat;
        this.lng = this.center.lng;
        this.createMap();
      });
    }
  }

  createMap(): void {
    const options: google.maps.MapOptions = {
      center: { lat: this.lat, lng: this.lng },
      zoom: this.mapZoom,
      minZoom: this.MIN_ZOOM,
      maxZoom: this.MAX_ZOOM,
      mapTypeId: 'roadmap',
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      mapTypeControl: false,
      zoomControl: true,
      tilt: 0,
    };

    this.map = new google.maps.Map(this.gmap.nativeElement, options);

    this.addRecenterCustomControl();
    this.addMarker();
    this.addCircle();
  }

  addMarker(): void {
    const marker = new google.maps.Marker({
      position: { lat: this.lat, lng: this.lng },
      map: this.map,
    });
    marker.setMap(this.map);
  }

  addCircle(): void {
    const circleCenter: google.maps.LatLngLiteral = {
      lat: this.lat,
      lng: this.lng,
    };

    this.circleOptions = {
      strokeColor: 'red',
      strokeOpacity: 0.9,
      radius: this.RADIUS,
      fillOpacity: 0.1,
      center: circleCenter, // Use 'center' property instead of 'circleCenter'
      draggable: true,
      editable: true,
    };

    this.circle = new google.maps.Circle(this.circleOptions);
    this.circle.setMap(this.map);

    google.maps.event.addListener(
      this.circle,
      'dragend',
      (event: google.maps.MapMouseEvent) => {
        //const newCenter: google.maps.LatLngLiteral = event.latLng.toJSON();
        this.reverseGeocode();
      }
    );

    google.maps.event.addListener(this.circle, 'radius_changed', () => {
      //const newCenter = this.circle.getCenter().toJSON();

      this.reverseGeocode();
    });

    // google.maps.event.addListener(this.circle, 'center_changed', () => {
    //   console.log('center changes');
    //   const newCenter = this.circle.getCenter().toJSON();
    //   this.reverseGeocode();
    //   // this.onCircleCenterChanged(newCenter);
    // });
  }

  addRecenterCustomControl() {
    const controlDiv = document.createElement('div');
    // Set CSS for the control border
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.style.marginTop = '100px';
    controlUI.style.marginRight = '10px';
    controlUI.title = 'Re-center Map';
    controlDiv.appendChild(controlUI);
    // Set CSS for the control interior
    const controlText = document.createElement('div');
    controlText.style.color = '#990000';
    controlText.style.fontSize = '16px';
    controlText.style.fontWeight = 'bold';
    controlText.style.marginTop = '4px';
    //  // controlText.innerHTML = 'Center Map';
    controlText.style.width = '38px';
    controlText.style.height = '38px';
    controlText.innerHTML = `<i class="fa fa-arrow-circle-left fa-2x text-center"></i>`;
    controlUI.appendChild(controlText);
    controlUI.addEventListener('click', () => {
      this.map.setCenter({ lat: this.lat, lng: this.lng });
      this.map.setZoom(this.mapZoom);
    });

    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
  }

  reverseGeocode(): void {
    const geocoder = new google.maps.Geocoder();
    const numPoints = 360;
    const step = 360 / numPoints;
    const geocodePromises = [];

    this.citiesCovered = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = i * step;
      const point = google.maps.geometry.spherical.computeOffset(
        this.circle.getCenter(),
        this.circle.getRadius(),
        angle
      );

      const geocodePromise = new Promise((resolve) => {
        geocoder.geocode({ location: point }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const cityName = this.extractMajorCity(results);
            if (cityName && !this.citiesCovered?.includes(cityName)) {
              this.citiesCovered.push(cityName);
            }
          }
          resolve([]); // Resolve the promise regardless of geocoding success or failure
        });
      });

      geocodePromises.push(geocodePromise);
    }

    // Wait for all geocoding promises to resolve
    Promise.all(geocodePromises).then(() => {
      this.storageService.updateMapSearchSelectedCities(this.citiesCovered);
    });
  }

  private extractFormattedAddress(
    results: google.maps.GeocoderResult[]
  ): string | null {
    for (const result of results) {
      for (const component of result.address_components) {
        if (
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_1')
        ) {
          return result.formatted_address;
        }
      }
    }
    return null;
  }
  private extractMajorCity(
    results: google.maps.GeocoderResult[]
  ): string | null {
    for (const result of results) {
      for (const component of result.address_components) {
        if (
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_1')
        ) {
          return component.long_name;
        }
      }
    }
    return null;
  }
}
