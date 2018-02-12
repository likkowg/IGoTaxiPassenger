import { Component } from '@angular/core';
import { NavController, LoadingController, NavParams } from 'ionic-angular';
import { PlaceService } from '../../services/place-service';
import { Geolocation } from '@ionic-native/geolocation';
import { HomePage } from "../home/home";
import { MapPage } from "../map/map";
import { TripService } from "../../services/trip-service";

declare var google: any;

/*
 Generated class for the PlacesPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-places',
  templateUrl: 'places.html'
})
export class PlacesPage {
  // map id
  mapId = Math.random() + 'map';

  // all places
  places: any;

  // search keyword
  keyword = '';

  // lat & lon
  lat: number;
  lon: number;

  // loading object
  loading: any;

  // page loaded flag
  pageLoaded = false;

  // google map place service
  mapService: any;

  constructor(public nav: NavController, public placeService: PlaceService, public geolocation: Geolocation,
              public loadingCtrl: LoadingController, public navParams: NavParams, public tripService: TripService) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
  }

  // show search input
  ionViewDidEnter() {
    this.pageLoaded = true;

    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lon = resp.coords.longitude;
      this.loadMap();
      this.search();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  // hide search input
  ionViewWillLeave() {
    this.pageLoaded = false;
  }

  // load google map service
  loadMap() {
    const latLng = new google.maps.LatLng(this.lat, this.lon);
    let map = new google.maps.Map(document.getElementById(this.mapId), {
      center: latLng
    });
    this.mapService = new google.maps.places.PlacesService(map);
  }

  // choose a place
  selectPlace(place) {
    if (this.navParams.get('type') == 'origin') {
      this.tripService.setOrigin(place.vicinity, place.geometry.location.lat(), place.geometry.location.lng());
    } else {
      this.tripService.setDestination(place.vicinity, place.geometry.location.lat(), place.geometry.location.lng());
    }

    this.nav.setRoot(HomePage);
  }

  // clear search input
  clear() {
    this.keyword = '';
    this.search();
  }

  // search by address
  search() {
    this.showLoading();
    this.mapService.nearbySearch({
      location: new google.maps.LatLng(this.lat, this.lon),
      keyword: this.keyword,
      radius: 50000
    }, (results) => {
      this.hideLoading();
      this.places = results;
    })
  }

  // calculate distance from a place to current position
  calcDistance(place) {
    return this.placeService.calcCrow(place.geometry.location.lat, place.geometry.location.lng, this.lat, this.lon).toFixed(1);
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Por favor, espere...'
    });
    this.loading.present();
  }

  hideLoading() {
    this.loading.dismiss();
  }

  // open map page
  openMap() {
    this.nav.push(MapPage, {type: this.navParams.get('type')});
  }
}
