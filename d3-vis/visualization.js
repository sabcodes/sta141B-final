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

svg.append("text")
    .attr("x", 150)
    .attr("y", 40)
    .attr("font-size", 25)
    .text("Average Total Cases Per Capita At Colleges");

svg.append("text")
    .attr("x", 300)
    .attr("y", 70)
    .attr("font-size", 20)
    .text("You can click!");


var selected = null;
var old_selected = function () {

};

var parts = {};

var data_states = {};
// var data_states;

d3.json("../states.json", function (d) {
    data_states['states'] = d;
});

// states = states[0];

d3.json("../data_states.json", function (d) {
    data_states['data_states'] = d;
});

d3.json("../all_states.json", function (d) {
    data_states['all_states'] = d;
});

d3.json("../sample.json", function (d) {
    data_states['sample'] = d;
});

console.log(data_states);

var svg_graph = d3.select("body")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);

var selected_state_title = svg_graph.append("text")
    .attr("x", 150)
    .attr("y", 40)
    .attr("font-size", 25)
    .text("All States");

var graph_side_graph = function (state) {
    svg_graph.selectAll("*").remove();
    if (state == null) {
        selected_state_title = svg_graph.append("text")
            .attr("x", 150)
            .attr("y", 40)
            .attr("font-size", 25)
            .text("All States");

        var x = d3.scaleBand().range([0, 500]).domain(Object.keys(data_states.all_states)).paddingInner(0.6);
        var y = d3.scaleLinear().range([400, 0]);


        x = x.domain(Object.keys(data_states.all_states));

        var xAxis = d3.axisBottom().scale(x);
        var yAxis = d3.axisLeft().scale(y);

        var max = 0;

        for (part in data_states.all_states) {
            var temp = data_states.all_states[part].cases_per_capita;
            if (temp > max) {
                max = temp;
            }
        }

        y.domain([0, max]);

        svg_graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(50," + 400 + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)");

        svg_graph.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(50," + 0 + ")")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .style("text-anchor", "end")
            .text("Frequency");

        svg_graph.append("text")
            .attr("transform", "rotate(90)")
            .attr("x", 50)
            .attr("y", 0)
            .attr("font-size", 16)
            .text("Per capita cases for colleges at types of locations");


        // console.log(data_states.all_states);

        for (var part in data_states.all_states) {
            svg_graph.append("rect")
                .attr("x", x(part) + 50)
                .attr("fill", "skyblue")
                .attr("width", x.bandwidth())
                .attr("y", y(data_states.all_states[part].cases_per_capita))
                .attr("height", function (d) {
                    return 400 - y(data_states.all_states[part].cases_per_capita);
                });
        }

        //All states
    } else {
        var x = d3.scaleBand().range([0, 500]).domain(Object.keys(data_states.sample[state])).paddingInner(0.6);
        var y = d3.scaleLinear().range([400, 0]);

        console.log(data_states.sample[state]);


        x = x.domain(Object.keys(data_states.sample[state]));

        var xAxis = d3.axisBottom().scale(x);
        var yAxis = d3.axisLeft().scale(y);

        var max = 0;

        for (thingy in data_states.sample[state]) {
            var temp = data_states.sample[state][thingy];
            if (temp > max) {
                max = temp;
            }
        }

        y.domain([0, max]);

        svg_graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(50," + 400 + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)");

        svg_graph.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(50," + 0 + ")")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Frequency");

        svg_graph.append("text")
            .attr("transform", "rotate(90)")
            .attr("x", 50)
            .attr("y", 0)
            .attr("font-size", 16)
            .text("Per capita cases for colleges at types of locations");

        // console.log(data_states.all_states);

        for (var part in data_states.sample[state]) {
            // console.log(data_states.all_states[part].cases_per_capita);
            svg_graph.append("rect")
                .attr("x", x(part) + 50)
                .attr("fill", "skyblue")
                .attr("width", x.bandwidth())
                .attr("y", y(data_states.sample[state][part]))
                .attr("height", function (d) {
                    return 400 - y(data_states.sample[state][part]);
                });
        }

         selected_state_title = svg_graph.append("text")
            .attr("x", 150)
            .attr("y", 40)
            .attr("font-size", 25)
            .text(state);
    }
}


// svg_graph.append

// Load in my states data!
d3.csv("../college_state_averages.csv", function (data) {
    var dataArray = [];
    for (var d = 0; d < data.length; d++) {
        dataArray.push(parseFloat(data[d].cases_per_capita));
    }
    var minVal = d3.min(dataArray);
    var maxVal = d3.max(dataArray);
    var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor]);

    d3.json("us-states.json", function (json) {

        for (var i = 0; i < data.length; i++) {

            var dataState = data[i].state;
            var dataValue = data[i].cases_per_capita;

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

        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                return ramp(d.properties.value);
            })
            .on("click", function (d) {
                old_selected();
                if (selected == d) {
                    d3.select(this).style("fill", ramp(d.properties.value));
                    selected = null;
                    old_selected = function () {
                    }
                    graph_side_graph(null);
                } else {
                    d3.select(this).style("fill", "#0f0");
                    selected = d;

                    var thingy = d3.select(this);

                    old_selected = function () {
                        thingy.style("fill", ramp(d.properties.value));
                    }
                    // selected_state_title.text(d.properties.name);
                    graph_side_graph(d.properties.name);
                }
            });

        graph_side_graph(null);

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

// graph_side_graph(null);

