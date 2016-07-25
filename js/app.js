//Google PLaces: https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=33.0039673,-97.2257894&keyword=ice+cream&key=AIzaSyCXw_dyrr3o4e2Y_B1yCFiYTLSRQAdxqcQ&v=3



var AppViewModel = function(jsonData) {

  var self = this;
  self.filterLocs = ko.observable("");
  self.creameryLocations = ko.observableArray([]);

  self.Location = function(loc) {
    this.name = ko.observable(loc.name);
    this.id = ko.observable(loc.id);
    this.isActive = ko.observable(false);
    this.place_id = ko.observable(loc.place_id);
    this.lat = ko.observable(loc.geometry.location.lat);
    this.lng = ko.observable(loc.geometry.location.lng);
    this.icon = ko.observable(loc.icon);
  }

  self.mappedLocations = ko.utils.arrayMap(jsonData.results, function(loc) {
    return new self.Location(loc);
  });
  self.creameryLocations(self.mappedLocations);

  self.filteredLocations = ko.computed(function() {
    var filterLocs = self.filterLocs().toLowerCase();
    if (!filterLocs) {
        return self.creameryLocations();
    } else {
        return ko.utils.arrayFilter(self.creameryLocations(), function(loc) {
            return loc.name().toLowerCase().includes(filterLocs);
        });
    }
  }, self);

  self.getLocDetails = function(loc){
    for (var i = 0; i < self.creameryLocations().length; i++) {
      if(self.creameryLocations()[i].place_id() == loc.place_id()){
        self.creameryLocations()[i].isActive(true);
      } else {
        self.creameryLocations()[i].isActive(false);
      }
    }
    //myObservableArray.splice(1, 3)
    //self.creameryLocations.remove(loc);
    console.log(loc);
    activeMarker(loc.place_id());

    loc.isActive(true);
  };

  self.filteredLocations.subscribe(function (newData) {
    refreshMarkers(self.filteredLocations());
    console.log("subscribe ran");
  });
}

var map;
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  $.getJSON("http://lowjack98.github.io/data/places.json?", function(jsonData) {
    var myViewModel = new AppViewModel(jsonData);
    ko.applyBindings(myViewModel);
    console.log('myViewModel');
    console.log(myViewModel.creameryLocations());
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.0039673, lng: -97.2257894},
      zoom: 11
    });
    initMarkers(myViewModel.creameryLocations());
  });
}
//console.log(myViewModel.creameryLocations());
function activeMarker(place_id) {
  for (var i = 0; i < markers.length; i++) {
    if(markers[i].place_id == place_id){
      markers[i].setAnimation(google.maps.Animation.BOUNCE);
    } else {
      markers[i].setAnimation();
    }
  }
}

function initMarkers(arrMarkers) {
  $.each( arrMarkers, function( key, value ) {
    var marker = new google.maps.Marker({
      position: {lat: value.lat(), lng: value.lng()},
      map: map,
      place_id: value.place_id(),
      //icon: icon,
      title: value.name()
    });
    markers.push(marker);
  });
}

function refreshMarkers(filteredLocations) {
  var visPlaces = [];
  for (var i = 0, len = filteredLocations.length; i < len; i++) {
    visPlaces.push(filteredLocations[i].place_id());
  }
  for (var i = 0; i < markers.length; i++) {
    if($.inArray(markers[i].place_id,visPlaces) > -1){
      markers[i].setVisible(true);
    } else {
      markers[i].setVisible(false);
    }
  }
}

$(document).ready(function() {
  //ko.applyBindings(new AppViewModel());
  //var geocoder = new google.maps.Geocoder();
  //console.log(document);
  /*
  $.getJSON("http://lowjack98.github.io/data/places.json", function(data) {
    console.log("Json data:");
    console.log(data);
    var parsed = JSON.parse(data);
    console.log(parsed);
    ko.applyBindings(new AppViewModel());
      // Now use this data to update your view models,
      // and Knockout will update your UI automatically
  });
  */
});
