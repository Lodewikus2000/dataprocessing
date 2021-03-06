d3.select("head").append("title").text("Renewable energy");
d3.select("body").append("div").attr("class", "container").style("max-width", "1024px").style("margin", "auto");
d3.select(".container").append("h1").text("Renewable energy").style("color", "#00995c");
d3.select(".container").append("p").text("Bar chart made by Leo Schreuders, student ID 5742978, for the course Data Processing at the University of Amsterdam");
d3.select(".container").append("p").text("The bar chart shows the amount of renewable energy a country produces in a given year. It is measured in kilo tonne of oil equivalent (ktoe). Mouse over the bars or country codes to see the exact numbers and full country names.");
// The drop down list for the years.
d3.select(".container").append("p").text("Select a year: ").append("select").attr("id", "year");

var w = 900;
var h = 600;


var svg = d3.select(".container").append("div")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("margin", "auto")
    .style("display", "block");


d3.select(".container").append("a").text("Data source").attr("href", "https://data.oecd.org/energy/renewable-energy.htm");


var tooltip = d3.select(".container").append("div").attr("class", "tooltip");
tooltip.style("position", "absolute")
    .style("display", "none")
    .style("min-width", "80px")
    .style("height", "auto")
    .style("background", "none repeat scroll 0 0 #ffffff")
    .style("border", "2px solid #00995c")
    .style("padding", "10px")
    .style("font-family", "sans-serif")
    .style("font-size", "12px")
    .style("text-align", "center");


// Found here https://gist.github.com/Keeguon/2310008.
var countriesMap = [];

// load the json that maps iso3 codes to country names.
d3.json("iso-3-country-code-mapping.json").then(mapping => countriesMap = mapping);


d3.json("data.json").then(d => chart(d));



function chart(data) {

  console.log(data);
    // This is the function that draws the actual bar chart.
    // Based on https://bl.ocks.org/LemoNode/73dbb9d6a144476565386f48a2df2e3b

    var countries = [...new Set(data.map(d => d.LOCATION))];
    var years = [...new Set(data.map(d => d.TIME))];


    // Add the years to the select element.
    var options = d3.select("#year").selectAll("option")
        .data(years.reverse())
        .enter().append("option")
        .text(d => d);


    var margin = {
        left: 50,
        right: 20,
        top: 20,
        bottom: 40
    };

    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;


    // Set a scale for the y-axis.
    var y = d3.scaleLinear();
    y.range([height, 0]);


    // Set a funcion for the y-axis.
    var yAxis = g => g
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(y))


    // Add an element to the svg for the y-axis.
    svg.append("g")
        .attr("class", "y-axis")


    // Set the x-axis.
    var x = d3.scaleBand()
        .domain(countries)
        .range([0, width])
        .padding(0.1)
        .paddingOuter(0.2)


    // Add the x-axis and labels.
    svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("class", "xLabel")
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", - x.bandwidth() / 4 + "px")
        .attr("transform", "rotate(-90)");


    update(d3.select("#year").property("value"), 0)


    var yLabelMargin = 10;
    svg.selectAll(".y-axis")
    .append("text")
          .attr("y", - yLabelMargin)
          .style("text-anchor", "end")
          .style("fill", "black")
          .text("ktoe");

    function update(year, speed) {
        // This function updates the bar chart for a given year.

        var yearData = data.filter(d => d.TIME == year)

        var maxValue = d3.max(yearData, d => d.Value);

        // Set the domain given the year.
        var scaleFactor = 1.05
        y.domain([0, maxValue * scaleFactor]);

        svg.selectAll(".y-axis").transition().duration(speed)
            .call(yAxis);

        var bar = svg.selectAll(".bar").data(yearData);

        bar.exit().remove();

        bar.enter().append("rect")
            .attr("class", "bar")
            .attr("fill", "#00e68a")
            .attr("width", x.bandwidth())
            .merge(bar)
            .transition().duration(speed)
            .attr("height", function(d) {
                if (d.Value == null) {
                    return height - y(0);
                };
                return height - y(d.Value);
            })
            .attr("x", function(d, i) {
                return x(d.LOCATION) + margin.left;
            })
            .attr("y", function(d) {
                if (d.Value == null) {
                    return margin.top + y(0);
                };
                return margin.top + y(d.Value);
            });

        mouseOver(year);

    };


    chart.update = update;


    function mouseOver(year) {
        var yearData = data.filter(d => d.TIME == year)

        // Show the tooltip when the user mouses over the bars.
        var bar = svg.selectAll(".bar").data(yearData)
        bar.on("mousemove", function(d) {
                tooltip.style("left", (d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY - 100) + "px")
                    .style("display", "inline-block")
                    .html(countriesMap[d.LOCATION].countryName + "<br>" + "Renewable energy:" + "<br>" + (d.Value) + " ktoe");
                d3.select(this).attr("fill", "#ff471a");
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none");
                bar.attr("fill", "#00e68a");
            });

        // Also show the tooltip when the user mouses over the x-axis labels.
        var label = svg.selectAll(".xLabel").data(yearData);
        label.on("mousemove", function(d) {
                // Select the bar with the same location.
                var oneBar = d3.selectAll(".bar").filter(function(e) {
                    return d.LOCATION == e.LOCATION;
                })
                oneBar.attr("fill", "#ff471a")
                tooltip.style("left", (d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY - 100) + "px")
                    .style("display", "inline-block");
                if (d.Value == null) {
                    tooltip.html(countriesMap[d.LOCATION].countryName + "<br>" + "No data");
                } else {
                    tooltip.html(countriesMap[d.LOCATION].countryName + "<br>" + "Renewable energy:" + "<br>" + (d.Value) + " ktoe");
                };
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none");
                bar.attr("fill", "#00e68a")
            });

    };
}

// Call the update function of the bar chart when a new year is selected.
var select = d3.select("#year")
.style("border-radius", "5px")
.on("change", function() {
    chart.update(this.value, 750)
});
