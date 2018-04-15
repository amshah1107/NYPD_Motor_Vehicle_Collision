function renderStreetMap() {
   
  // Initializes the basemap.
        var map = L.map("map_container2",{center:[40.773889, -73.983611],zoom:12});
        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // D3-SVG-Overlay callback wrapper. Leaflet is used only for the base map, all of the programmatic action occurs
        // in d3 code inside of this callback.
        
        var mapOverlay = L.d3SvgOverlay(function(sel,proj){

            // Paints a single sampler path.
            function paintPath(linearray) {
                console.log(linearray);

                // Define x and y conversions.
                var line = d3.line()
                        .x(function(d) { console.log(d); return proj.latLngToLayerPoint(d).x})
                        .y(function(d) { console.log(d); return proj.latLngToLayerPoint(d).y});

                console.log(line);

                sel.append("path")
                        .datum(linearray)
                        // TODO: Troubleshoot why the line is so funky.
                        .attr({
                            "class": "sample-line",
                            "d": line,
                            "fill": "transparent",
                            "stroke": "steelblue",
                            "stroke-width": 0.1,
                            "shape-rendering": "crispEdges"
                        })
            }

            // Paints a single sampler path (paints things as a pile of points).
            // Test method, now disused.
            function paintPointPath(pointarray) {
                console.log(pointarray);
                sel.append('g')
                        .selectAll('circle')
                        .data(pointarray)
                        .enter()
                        .append('circle')
                        .attr({
                            "cx": function (d) {
                                return proj.latLngToLayerPoint(d).x;
                            },
                            "cy": function (d) {
                                return proj.latLngToLayerPoint(d).y;
                            },
                            "r": 0.2
                        });
            }

            // Paints all of the paths.
            function paintPathSampler() {
                d3.json("path_sampler.json", function (data) {
                    console.log(data[0]);

                    paintPath(data[0]);
                    paintPath(data[1]);
//                     paintPointPath(data[0]);

                });
            }

//            function paintPathSampler() {
//                d3.json("../../static/post_assets/citibike/bike_week_sampler.json", function (data) {
//                    console.log(data);
//                    console.log(data[0]);
//
//                    paintPointPath(data[0]);
//
//                });
//            }

            function delayedHello(callback) {
                setTimeout(function() {
                    console.log("Hello!");
                    callback(null);
              }, 10);
            }

            q = d3.queue();
            q.defer(paintPathSampler);
            q.defer(delayedHello);
            q.await(function(error) {
                if (error) throw error;
                console.log("Goodbye!");
            });

            // ACTUAL CODE
            // Now we define the functions to be called as part of the visualization.


            // Set up a d3 queue for managing event order.
//            var q = d3.queue();
//            d3.csv("nyc-starbucks-locations.csv", function(data) {
//                sel.selectAll('circle')
//                        .data(data)
//                        .enter()
//                        .append('circle')
//                        .attr({
//                            "cx": function(d) { return proj.latLngToLayerPoint([d.latitude, d.longitude]).x; },
//                            "cy": function(d) { return proj.latLngToLayerPoint([d.latitude, d.longitude]).y; },
//                            "r": 4
//                        });
//            });
        });

        // Add overlay to map.
        mapOverlay.addTo(map);

}
