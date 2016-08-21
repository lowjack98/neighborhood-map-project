// YELP API LOGIN CREDS
YELP_KEY = "Xb1L_N6TPqB0IbTz4PBOPQ";
YELP_KEY_SECRET = "oj3VMxvqxLCCxRB3GC8kTjAfJyY";
YELP_TOKEN = "f_TkmMrVVMu6ZiLcge6N76cUIIoHq4SY";
YELP_TOKEN_SECRET = "GAn-td0aHCHuypLG20wUNotaVaE";

var AppViewModel = function(jsonData) {

  var self = this;
  //observable variable that controls the filer text
  self.filterLocs = ko.observable("");
  //master array of locations
  self.creameryLocations = ko.observableArray([]);
  //observable shows/hides the list of filtered locations when screen has collapsed
  self.showShopList = ko.observable(true);
  //function to toggle showShopList
  self.toggleShowShopList = function() {
    if(self.showShopList()) {
      self.showShopList(false);
    } else {
      self.showShopList(true);
    }
  }

  //This function builds required observables for each location in the creameryLocations array
  self.Location = function(loc) {
    this.name = ko.observable(loc.name);
    this.id = ko.observable(loc.id);
    this.isActive = ko.observable(false);
    this.place_id = ko.observable(loc.place_id);
    this.lat = ko.observable(loc.geometry.location.lat);
    this.lng = ko.observable(loc.geometry.location.lng);
    this.icon = ko.observable(loc.icon);
    this.yelp_id = ko.observable(loc.yelp_id);
  };

  //This function builds required observables for the yelp details modal
  self.modalData = {
    text: 'First template',
    label: ko.observable('Observable label'),
    rating: ko.observable(),
    review_count: ko.observable(),
    mobile_url: ko.observable(),
    rating_img_url: ko.observable(),
    name: ko.observable(),
    rating_img_url_small: ko.observable(),
    url: ko.observable(),
    snippet_text: ko.observable(),
    image_url: ko.observable(),
    snippet_image_url: ko.observable(),
    display_phone: ko.observable(),
    rating_img_url_large: ko.observable(),
    address: ko.observable()
  };

  //This function updates the yelp details modal
  self.updateModalData = function(loc) {
    var md = self.modalData;
    md.text = 'First template';
    md.label('Observable label');
    md.rating(loc.yelpData.rating);
    md.review_count(loc.yelpData.review_count);
    md.rating_img_url(loc.yelpData.rating_img_url);
    md.name(loc.name());
    md.url(loc.yelpData.url);
    md.snippet_text(loc.yelpData.snippet_text);
    md.image_url(loc.yelpData.image_url);
    md.snippet_image_url(loc.yelpData.snippet_image_url);
    md.display_phone(loc.yelpData.display_phone);
    md.rating_img_url_large(loc.yelpData.rating_img_url_large);
    md.address(loc.yelpData.location.display_address);
  }

  //This function builds an array of hardcoded locations from places.json
  self.mappedLocations = ko.utils.arrayMap(jsonData.results, function(loc) {
    return new self.Location(loc);
  });
  //Then the array is made observable here.
  self.creameryLocations(self.mappedLocations);
  //This is the list of creameries after the filter has been applied. this is the list that is displayed to the user
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
  //function returns all of the observable variables for a specific location when given a place_id
  self.getLocByPlaceId = function(place_id){
    for (var i = 0; i < self.creameryLocations().length; i++) {
      if(self.creameryLocations()[i].place_id() == place_id){
        return self.creameryLocations()[i];
      }
    }
  };
  //This function is called when a user clicks on the list element or the marker on the map
  //It sets the correct marker to animate then retrieves the yelp data for the selected location and activates the yelp modal
  self.getLocDetails = function(loc){
    for (var i = 0; i < self.creameryLocations().length; i++) {
      if(self.creameryLocations()[i].place_id() == loc.place_id()){
        self.creameryLocations()[i].isActive(true);
      } else {
        self.creameryLocations()[i].isActive(false);
      }
    }
    activeMarker(loc.place_id());
    loc.isActive(true);
    var yelpData = getYelpBusinessInfo(loc.yelp_id());
    yelpData.done(function(results){
      loc.yelpData = results;
      self.updateModalData(loc);
      self.modalVisible(true);
    })
    yelpData.fail(function(results){
      alert("Unable to retrieve Yelp data. Please check your network connection and retry later.");
    });
  };
  // This looks for a change in the filtered location list and updates the google maps markers as needed
  self.filteredLocations.subscribe(function (newData) {
    refreshMarkers(self.filteredLocations());
  });
  //this is an observable variable to control the display of the yelp modal.
  self.modalVisible = ko.observable(false);
  //this function makes the modal visible.
  self.show = function() {
    self.modalVisible(true);
  };

}

//Below are defined due to async loading.
var map;
var markers = [];
var myViewModel;

// This function runs once the google maps api has completed loading.
// It retrieves the hardcoded locations from places.json,
//   activates the app view modal, and creates the map and required markers.
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  //var places = $.getJSON( "http://lowjack98.github.io/data/places.json?")
  var places = $.getJSON( "data/places.json?")
  .done(function(jsonData) {
    //initialize VM with json location data
    myViewModel = new AppViewModel(jsonData);
    ko.applyBindings(myViewModel);
    //initialize map
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.0039673, lng: -97.2257894},
      zoom: 11
    });
    // create markers using VM array of locations
    initMarkers(myViewModel.creameryLocations());
  })
  .fail(function(error) {
    alert("Unable to retrieve the list of ice cream shops. Please check your network connection and try again later.")
    console.log('error getting places.json');
    console.log(error);
  });
}
// This function loops thru the markers array and sets the correct marker to animate/bounce
function activeMarker(place_id) {
  for (var i = 0; i < markers.length; i++) {
    if(markers[i].place_id == place_id){
      markers[i].setAnimation(google.maps.Animation.BOUNCE);
    } else {
      markers[i].setAnimation();
    }
  }
}
// This function loops thru the markers array and sets the correct marker to animate/bounce
function initMarkers(arrMarkers) {
  $.each( arrMarkers, function( key, value ) {
    var marker = new google.maps.Marker({
      position: {lat: value.lat(), lng: value.lng()},
      map: map,
      place_id: value.place_id(),
      cat_icon: value.icon(),
      title: value.name()
    });
    //add listener so we know when the user clicks on a marker
    marker.addListener('click', function() {
      map.setCenter(this.getPosition());
      var loc = myViewModel.getLocByPlaceId(this.place_id);
      myViewModel.getLocDetails(loc);
    });
    markers.push(marker);
  });
}
// This function loops thru the entire locations array and shows or hides them based on what was filtered
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
//This function call the yepl api for business data
function getYelpBusinessInfo(business_id) {
  var d = $.Deferred();
  function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
  }
  var yelp_url = 'http://api.yelp.com/v2/business/'+business_id;
  var parameters = {
    oauth_consumer_key: YELP_KEY,
    oauth_token: YELP_TOKEN,
    oauth_nonce: nonce_generate(),
    oauth_timestamp: Math.floor(Date.now()/1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version : '1.0',
    callback: 'cb'
  };
  var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
  parameters.oauth_signature = encodedSignature;
  var yelpCall = $.ajax({
    url: yelp_url,
    data: parameters,
    cache: true,
    dataType: 'jsonp',
  })
  .done( function(yelpResults) {
    yelpResults.status = 'ok';
    d.resolve(yelpResults);
  })
  .fail(function(xhr, status, error) {
    yelpResults = {};
    yelpResults.status = 'error';
    yelpResults.error = error;
    yelpResults.error_msg = xhr.status;
    d.reject(yelpResults);
  });
  return d.promise();
}
//This function is call when the google api is unable to be reached.
function noBuenoGoogle(){
  alert("Unable to reach the Google Maps API. Please check your network connection and try again later.");
}
