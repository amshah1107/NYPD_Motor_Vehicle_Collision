function renderStreetMap() {
   console.log("In street map")
   var mymap = L.map('map_container2').setView([40.773889, -73.983611], 13);

   L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiYW1zaGFoIiwiYSI6ImNqZnZvejlvNTRiZGozMG52ZHJ0OHlkYTAifQ.Ib_ltUCeiLgEfZImm93WzA'
}).addTo(mymap);

   var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

  // L.geoJSON(topaccidents_json.features).addTo(map);
   L.geoJSON(topaccidents_json.features, {
    pointToLayer: function (feature, latlng) {
        console.log(feature)
        console.log(latlng);
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
   }).addTo(mymap);
console.log("after map31");
}
