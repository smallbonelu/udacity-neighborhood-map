
var map;
var marker;
function error_handler() {
  alert("The Google Maps API has failed. Please check your internet connection and try again later.");
}

function createMarker(latlng) {
  marker = new google.maps.Marker({
    position: latlng,
    map: map,
    animation: null
  });
  return marker;
}

//Model
var locations = [{
    name: "Café Integral",
    address: "149 Elizabeth St, Little Italy, New York, NY 10012",
    lat: 40.720428,
    lng: -73.995315,
    yelp_website: "https://api.yelp.com/v2/business/cafe-integral-new-york-2"
  },
  {
    name: "Little Canal",
    address: "26 Canal St, Lower East Side, New York, NY 10002",
    lat: 40.71431,
    lng: -73.99041,
    yelp_website: "https://api.yelp.com/v2/business/little-canal-new-york-2"
  },
  {
    name: "Coffee Project New York",
    address: "239 E 5th St, East Village, New York, NY 10003",
    lat: 40.72699,
    lng: -73.98922,
    yelp_website: "https://api.yelp.com/v2/business/coffee-project-new-york-new-york"
  },
  {
    name: "Spreadhouse Cafe",
    address: "116 Suffolk St, Lower East Side, New York, NY 10002",
    lat: 40.71891,
    lng: -73.985847,
    yelp_website: "https://api.yelp.com/v2/business/spreadhouse-cafe-new-york-3"
  },
  {
    name: "Prologue Coffee Room",
    address: "120C Lafayette St, SoHo, New York, NY 10013",
    lat: 40.7189198956263,
    lng: -74.0004087871495,
    yelp_website: "https://api.yelp.com/v2/business/prologue-coffee-room-new-york-2"
  }
];

function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
}

// Invoke Yelp API by using oauth-signature-js(https://github.com/bettiolo/oauth-signature-js)
var yelp_api = function(i) {
  var yelp_url = locations[i].yelp_website;
  var parameters = {
      oauth_consumer_key: 'jMkHVdUGQ4rERQEgvA44ag',
      oauth_token: 'orJhcYm__MlP9Df6T4KjbeklYJVsbhIg',
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      callback: 'cb'
  };
  var consumerSecret = 'CF3dFGmnNahEB9JkozBC-_vsSN4';
  var tokenSecret = '9-VSVbV7sJNKZZy0t1twi1qCbLc';
  // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
  var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, consumerSecret, tokenSecret);
  // generates a BASE64 encode HMAC-SHA1 hash
  parameters.oauth_signature = encodedSignature;
  var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,
      dataType: 'jsonp',
      success: function(results) {
        locations[i].url = results.url;
        locations[i].rating_img_url_large = results.rating_img_url_large;
        locations[i].snippet_text = results.snippet_text;
      },
      error: function() {
        alert("Opps! The Yelp API call has failed. Please try again later.");
      }
  };
  $.ajax(settings);
}

// Loop through each location and invoke Yelp API to the related information
for(var i = 0; i < locations.length; i++) {
    yelp_api(i);
}

// Initial Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.720428, lng: -73.995313},
    zoom: 14
  });

  var infowindow = new google.maps.InfoWindow({
      maxWidth: 300,
      content: null
    });

//Invoke Knockout JS framework to create a ViewModel
  var viewModel = function() {
    var self = this;
    self.locations = ko.observableArray(locations);
    self.value = ko.observable('');
    for (var i = 0; i < locations.length; i++) {
      locations[i].marker = createMarker(new google.maps.LatLng(locations[i].lat, locations[i].lng));
    }
    self.locations().forEach(function(location) {
      var marker = location.marker;
      google.maps.event.addListener(marker, 'click', function() {
        var contentString = "<h1>" + location.name + "</h1>" + "<br>" + "<h3>Rating:</h3>" + "<img src=" + location.rating_img_url_large + ">" + "<h4>Review:</h4>" + "<p>" + location.snippet_text + "</p>" + "<a href=" + location.url + ">Go to Yelp Website for Place" + "</a>";
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){
          marker.setAnimation(null);
        }, 1400);
      });
    });
    self.openInfowindow = function(location) {
      google.maps.event.trigger(location.marker, 'click');
    }
    // Filter the list result depend on the input
    self.search = ko.computed(function() {
      return ko.utils.arrayFilter(self.locations(), function(place) {
        var match = place.name.toLowerCase().indexOf(self.value().toLowerCase()) >= 0;
        place.marker.setVisible(match);
        return match;
      });
    });
  };
  ko.applyBindings(new viewModel());
}

