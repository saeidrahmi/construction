import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { Observable } from 'rxjs';

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
  MIN_ZOOM = 14;
  MAX_ZOOM = 19;
  RADIUS = 40;
  mapZoom = 16;
  map!: google.maps.Map;
  EARTH_RADIUS_IN_MILES = 3956.0;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };

  constructor() {
    // Get current location
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

  createMap() {
    let options: google.maps.MapOptions = {
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
    console.log('options', options);
    this.map = new google.maps.Map(this.gmap.nativeElement, options);
    const mapOriginalCenterPoint = this.map.getCenter();

    this.addRecenterCustomControl();
    this.addMarker();
    this.addCircle();
  }
  addMarker() {
    const marker = new google.maps.Marker({
      position: {
        lat: this.lat,
        lng: this.lng,
      },
      map: this.map,
    });
    marker.setMap(this.map);
  }
  addCircle() {
    const circleCenter: google.maps.LatLngLiteral = {
      lat: this.lat,
      lng: this.lng,
    };
    const circleOptions = {
      strokeColor: 'red',
      strokeOpacity: 0.9,
      fillOpacity: 0.1,
      // circleDraggable:true,
      // editable: true
    };
    const circle = new google.maps.Circle(circleOptions);
    circle.setRadius(this.RADIUS);
    circle.setCenter(circleCenter);
    circle.setMap(this.map);
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
    const viewButton = document.createElement('div');
    viewButton.style.marginRight = '10px';
    viewButton.style.width = '38x';
    viewButton.title = 'Hybrid View';
    viewButton.style.height = '38px';
    viewButton.style.cursor = 'pointer';
    viewButton.style.borderStyle = 'solid';
    viewButton.style.borderColor = 'black';
    viewButton.style.borderWidth = '1px';
    viewButton.style.borderRadius = '14px';
    viewButton.style.fontSize = '24px';
    viewButton.style.background = "url('../../../assets/images/hybrid.png')";
    viewButton.style.backgroundSize = '38px 38px';
    controlDiv.appendChild(viewButton);
    viewButton.addEventListener('click', () => {
      if (this.map.getMapTypeId() == 'roadmap') {
        this.map.setMapTypeId('hybrid');
        viewButton.title = 'Roadmap View';
        viewButton.style.background =
          "url('../../../assets/images/roadmap.png')";
      } else {
        this.map.setMapTypeId('roadmap');
        viewButton.title = 'Hybrid View';
        viewButton.style.background =
          "url('../../../assets/images/hybrid.png')";
      }
      viewButton.style.backgroundSize = '28px 28px';
    });

    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
  }
}
