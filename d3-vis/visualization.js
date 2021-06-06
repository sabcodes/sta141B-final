//Width and height of map
var width = 800;
var height = 500;

var lowColor = '#d9d9d9'
var highColor = '#464abc'

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2 + 10]) // translate to center of screen
    .scale([800]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection


//Create SVG element and append map to the SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var svg_graph = d3.select("body")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);

var selected_state_title = svg_graph.append("text")
    .attr("x", 150)
    .attr("y", 40)
    .attr("font-size", 25)
    .text("All States");

svg.append("text")
    .attr("x", 150)
    .attr("y", 40)
    .attr("font-size", 25)
    .text("Average Total Cases Per Capita At Colleges");

var selected = null;
var old_selected = function () {

};

// Load in my states data!
d3.csv("../college_state_averages.csv", function (data) {
    var dataArray = [];
    for (var d = 0; d < data.length; d++) {
        dataArray.push(parseFloat(data[d].cases_per_capita))
    }
    var minVal = d3.min(dataArray)
    console.log(minVal)
    var maxVal = d3.max(dataArray)
    console.log(maxVal)
    var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])

    // Load GeoJSON data and merge with states data
    d3.json("us-states.json", function (json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

            // Grab State Name
            var dataState = data[i].state;


            // Grab data value
            var dataValue = data[i].cases_per_capita;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {

                    // Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;

                    // Stop looking through the JSON
                    break;
                }
            }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                console.log(d.properties);
                return ramp(d.properties.value);
            })
            .on("click", function (d) {
                old_selected();
                if (selected == d) {
                    d3.select(this).style("fill", ramp(d.properties.value));
                    selected = null;
                    old_selected = function () {
                        // d3.select(this).style("fill", ramp(d.properties.value));
                    }
                    selected_state_title.text("All States");
                } else {
                    // old_selected();

                    d3.select(this).style("fill", "#0f0");
                    selected = d;

                    var thingy = d3.select(this);

                    old_selected = function () {
                        thingy.style("fill", ramp(d.properties.value));
                    }
                    selected_state_title.text(d.properties.name);
                }
            });

        // add a legend
        var w = 140, h = 300;

        var key = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "legend");

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", highColor)
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", lowColor)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,10)");

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(41,10)")
            .call(yAxis)
    });
});