function AppViewModel() {
  this.searchLoc = ko.observable("76262");
//this.searchLoc = "76262";
}

// Activates knockout.js
$(document).ready(function() {
  ko.applyBindings(new AppViewModel());
});


// Create a map variable
var map;
     // Function to initialize the map within the map div
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.74135, lng: -73.99802},
    zoom: 14
  });
  // Create a single latLng literal object.
  var singleLatLng = {lat: 40.74135, lng: -73.99802};
  var marker = new google.maps.Marker({
    position: singleLatLng,
    map: map,
    title: 'Whats up Dawg!'
  });
  var infoWindow = new google.maps.InfoWindow();
  // TODO: create a single infowindow, with your own content.
  // It must appear on the marker
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.close();
      });
    }
  }
  marker.addListener('click', function() {
    populateInfoWindow(this, infoWindow);
  });

}
