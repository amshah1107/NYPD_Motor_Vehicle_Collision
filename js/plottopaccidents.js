/**
 * SVG structure:
 *   <svg> - container for entire map
 *     <g> - handle zoom and drag position
 *       <rect> - overlay a transparent layer for smooth zoom and drag
 *       <g> of <path> - each `path` is a district in the map
 *       <g> of <text> - districts' name
 *     </g>
 *   </svg>
 *
 * Reference:
 *   http://www.ourd3js.com/wordpress/296/
 *   https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45
 *   https://stackoverflow.com/questions/35443768/how-do-i-fix-zooming-and-panning-in-my-cluster-bundle-graph
 *   https://groups.google.com/forum/#!topic/d3-js/OAJgdKtn1TE
 *   https://groups.google.com/forum/#!topic/d3-js/sg4pnuzWZUU
 */

const WIDTH = 800; 
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80"

var w = WIDTH
var h = HEIGHT

// --------------- Event handler ---------------
const zoom = d3
  .zoom()
  .scaleExtent(ZOOM_THRESHOLD)
  .on("zoom", zoomHandler);

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function mouseOverHandler(burrough, i) {
  d3.select(this).attr("fill", HOVER_COLOR)
  burroughName = burrough.properties.name.toUpperCase()
  databydate = burrough_data.filter(function(d) { return d.key === selectedyear;}) 
  databydate = databydate[0].values
  borroughdatabydate = databydate.filter(function(d) { return d.key === burroughName})
  burrough_tip.show(borroughdatabydate[0].values)
     
}

function mouseOutHandler(d, i) {
  d3.select(this).attr("fill", color(i))
  burrough_tip.hide(d);
}

function clickHandler(d, i) {
  d3.select("#map__text").text(`${d.properties.name}`)
}

function clickToZoom(zoomStep) {
  svg
    .transition()
    .duration(ZOOM_DURATION)
    .call(zoom.scaleBy, zoomStep);
}

var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              console.log("In tip");
              console.log(d);
              return  "<strong>Year: </strong><span class='details'>" + 
                      d.properties.year +"<br></span>" + 
                      "<strong>People Killed: </strong><span class='details'>" + 
                      d.properties.numkilled +"<br></span>" + 
              	      "<strong>Longitude: </strong><span class='details'>" + 
                      d.properties.longitude + "<br></span>" +
                      "<strong>Latitude: </strong><span class='details'>" + 
                      d.properties.latitude +"<br></span>" + 
              	      "<strong>Street: </strong><span class='details'>" + 
                      d.properties.street + "<br></span>" +
              	      "<strong>Cross street: </strong><span class='details'>" + 
                      d.properties.xstreet + "<br></span>" + 
              	      "<strong>Temperature: </strong><span class='details'>" + 
                      d.properties.temp + "<br></span>" + 
              	      "<strong>Precipitation: </strong><span class='details'>" + 
                      d.properties.prec + "<br></span>" + 
              	      "<strong>Incident Date: </strong><span class='details'>" + 
                      d.properties.idate + "<br></span>" ;
            })

var burrough_tip = d3.tip()
            .attr('class', 'd3-tip2')
            .offset([-5, 0])
            .html(function(d) {
              return  "<strong>Year: </strong><span class='details'>" + 
                      d[0].Year +"<br></span>" + 
                      "<strong>Burrough: </strong><span class='details'>" + 
                      d[0].BOROUGH +"<br></span>" + 
                      "<strong>People Injured: </strong><span class='details'>" + 
                      d[0].PersonsInjured +"<br></span>" + 
              	      "<strong>People Killed: </strong><span class='details'>" + 
                      d[0].PersonsKilled + "<br></span>" +
                      "<strong>Pedistrians Injured: </strong><span class='details'>" + 
                      d[0].PedistriansInjured +"<br></span>" + 
              	      "<strong>Pedistrians Killed: </strong><span class='details'>" + 
                      d[0].PedistriansKilled + "<br></span>" +
              	      "<strong>Cyclist Injured: </strong><span class='details'>" + 
                      d[0].CyclistInjured + "<br></span>" +
              	      "<strong>Cyclist Killed: </strong><span class='details'>" + 
                      d[0].CyclistKilled + "<br></span>" + 
              	      "<strong>Total Accidents: </strong><span class='details'>" + 
                      d[0].TotalAccidents + "<br></span>" ;
            })

d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));

var burrough_data;
var selectedyear;

d3.csv("../data/burroughdata.csv", function(csv_data){
                    
            burrough_data = d3.nest()
                .key(function(d) { return d.Year; })
                .key(function(d) { return d.BOROUGH; })
                .entries(csv_data);
                
        });



//  --------------- Step 1 ---------------
// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.
const svg = d3
  .select("#map__container")
  .append("svg")
  .attr("height", "700px")
  .attr("width", "auto");
 // .attr("style","border:1px solid red;text-align:center;padding:0 50px 0 0");

const g = svg.call(zoom).append("g");

svg.call(tip)
svg.call(burrough_tip)

g
  .append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

// --------------- Step 2 ---------------
// Project GeoJSON from 3D to 2D plane, and set
// projection config.
const projection = d3
  .geoMercator()
  .center([114.1095, 22.3964])
  .translate([0, 0])
  .scale(1);
 // .scale(80000)
//  .translate([WIDTH / 2, HEIGHT / 2]);

// --------------- Step 3 ---------------
// Prepare SVG path and color, import the
// effect from above projection.
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));

// --------------- Step 4 ---------------
// 1. Plot the map from data source 
// 2. Place the district name in the map


renderMap(boroughs);

console.log("Completed")

function renderMap(root) {
                // Calculate bounding box transforms for entire collection
                var b = path.bounds( root ),
                s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
                t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

                // Update the projection    
                projection
                  .scale(s)
                  .translate(t);

  // Draw districts and register event listeners
  g
    .append("g")
    .selectAll("path")
    .data(root.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5)
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("click", clickHandler);

  // Place name labels in the middle of a district
  // Introduce some offset (dy, dx) to adjust the position
  g
    .append("g")
    .selectAll("text")
    .data(root.features)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("dx", d => _.get(d, "offset[0]", null))
    .attr("dy", d => _.get(d, "offset[1]", null))
    .text(d => d.properties.name);

var accidents = g.append( "g" ).attr( "id", "accidents" );


var selectedYear = '2018'

function updateGraph(accidents, selectedYear) {

   accidents.selectAll( "image" )
     .data( topaccidents_json.features )
     .on('mouseover',function(d){
             tip.show(d)})
     .on('mouseout', function(d){
             tip.hide(d)})
     .transition()
     .filter(function (d) { return (d.properties.year == selectedYear)})
       .attr("xlink:href","accident.png")
       .attr("opacity",0.7)
       .attr( "x", function(d){ 
          return projection( d.geometry.coordinates )[0];
       })
       .attr( "y", function(d){
          return projection( d.geometry.coordinates )[1];
       })
       .attr("width",25)
       .attr("height",15);
/*
*/

}

function initialGraph(accidents, selectedYear) {
   accidents.selectAll( "image" )
     .data( topaccidents_json.features )
     .enter()
     .append( "svg:image" )
     .filter(function (d) { return (d.properties.year == selectedYear)})
       .attr("xlink:href","accident.png")
       .attr("opacity",0.7)
       .attr( "x", function(d){ 
       return projection( d.geometry.coordinates )[0];
     })
       .attr( "y", function(d){
       return projection( d.geometry.coordinates )[1];
     })
       .attr("width",25)
       .attr("height",15)
     .on('mouseover',function(d){
             tip.show(d)})
     .on('mouseout', function(d){
             tip.hide(d)})
     .on( "click", function(){
     d3.select(this)
         .attr("opacity",0.3)
         .transition()
         .duration( 1000 )
         .attr( "x", w * Math.round( Math.random() ) )
         .attr( "y", h  * Math.round( Math.random() ) )
         .on("end",function(){
           d3.select(this).remove();
         })
     });
}

var nest = d3.nest()
	    .key(function(d){
	    	return d.properties.year;
	    })
	    .sortKeys(d3.ascending)
 	    .entries(topaccidents_json.features)

var yearMenu = d3.select("#yeardropdown")

    yearMenu
	.append("select")
	.selectAll("option")
    	    .data(nest)
       	    .enter()
            .append("option")
            .attr("value", function(d){
                  return d.key;
            })
            .text(function(d){
                return d.key;
            })

   yearMenu.on('change', function(){

 		// Find which fruit was selected from the dropdown
 		selectedyear = d3.select(this)
            .select("select")
            .property("value")

        updateGraph(accidents, selectedyear)
        console.log("after updateGraph")

    });

selectedyear = '2012';
initialGraph(accidents, selectedyear);
console.log("after initialgraph 2012")
}

