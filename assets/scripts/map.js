window.onload = function () {
  initMap();
};
function initMap() {
  // // map options
  var options = {
    zoom: 6,
    center: { lat: 37.9803952, lng: -74.6840892 },
    styles: [
      {
        elementType: "labels",
        stylers: [
          {
            visibility: "off",
          },
          {
            color: "#f49f53",
          },
        ],
      },
      {
        featureType: "landscape",
        stylers: [
          {
            color: "#f9ddc5",
          },
          {
            lightness: -7,
          },
        ],
      },
      {
        featureType: "water",
        stylers: [
          {
            color: "#1994bf",
          },
          {
            saturation: -69,
          },
          {
            gamma: 0.99,
          },
          {
            lightness: 43,
          },
        ],
      },
      {
        featureType: "poi.park",
        stylers: [
          {
            color: "#645c20",
          },
          {
            lightness: 39,
          },
        ],
      },
    ],
  };

  // new map
  var map = new google.maps.Map(document.getElementById("map"), options);

  var markers = [
    {
      name: "Assateague Island, MD",
      id: "5842041f4e65fad6a7708a1a",
      coords: { lat: 38.0933, lng: -75.2071 },
      icon: "assets/images/pirate-30px.png",
      get content() {
        return `<h3><a style=text-decoration:none; onclick=renderReportPage("${this.id}");>${this.name}</a></h3>`;
      },
    },
    {
      name: "Outer Banks, NC",
      id: "584204214e65fad6a7709d1b",
      coords: { lat: 35.5585, lng: -75.4665 },
      icon: "assets/images/pirate-30px.png",
      get content() {
        return `<h3><a style=text-decoration:none; onclick=renderReportPage("${this.id}");>${this.name}</a></h3>`;
      },
    },
    {
      name: "Rockaway Beach, NY",
      id: "584204214e65fad6a7709d0a",
      coords: { lat: 40.586712, lng: -73.811474 },
      icon: "assets/images/pirate-30px.png",
      get content() {
        return `<h3><a style=text-decoration:none; onclick=renderReportPage("${this.id}");>${this.name}</a></h3>`;
      },
    },
  ];

  for (var i = 0; i < markers.length; i++) {
    addMarker(markers[i]);
  }

  function addMarker(obj) {
    var marker = new google.maps.Marker({
      position: obj.coords,
      map: map,
      content: obj.content,
    });

    if (obj.icon) {
      marker.setIcon(obj.icon);
    }

    if (obj.content) {
      var infoWindow = new google.maps.InfoWindow({
        content: obj.content,
      });

      marker.addListener("click", function () {
        infoWindow.open(map, marker);
      });
    }
  }
}
