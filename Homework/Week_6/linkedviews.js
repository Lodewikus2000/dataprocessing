var w = 1024;
var h = 576;

var legendHeight = 256;
var legendWidth = 24;

var margin = {
    left: 20,
    right: 20,
    top: 20,
    bottom: 20
};

const YEAR = 2014;

window.onload = function() {


  var requests = [d3v5.json("data/life_expectancy_after.json")]

  Promise.all(requests).then(function(response) {


    var years = new Set();

    for (i = 0; i < response[0].length; i++) {
      years.add(response[0][i].Year);
    }
    years = Array.from(years);
    years.sort();

    var yearOptions = d3v5.select("#yearSelect").selectAll("option")
        .data(years.reverse())
        .enter().append("option")
        .text(d => d);



    life_expectancy_total = response[0].filter(d => d.Variable == "Total population at birth");

    drawMap(life_expectancy_total, yearOptions.property("value"));


    var yearOptions = d3v5.select("#yearSelect").on("change", function() {
        drawMap.update(this.value, 750);
    });


    dataCountry = response[0].filter(d => d.COU == "USA");
    drawLineGraph(response[0]);
    drawLineGraph.update("USA");



    // einde promise -> then function
  });


// einde onload
};


function drawLineGraph(dataset) {

    // help from https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0

    var dataHere = dataset;

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    yearMax = d3v5.max(dataHere, d => d.Year);
    yearMin = d3v5.min(dataHere, d => d.Year);
    console.log(yearMin);
    console.log(yearMax);








    var svg = d3v5.select("#lineSVG").attr("width", w).attr("height", h);





    // x axis scale
    var xScale = d3v5.scaleLinear()
        .domain([yearMin, yearMax])
        .range([0, width]);
    // x axis function
    var xAxis = g => g
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
        .call(d3v5.axisBottom(xScale));
    // x axis element
    svg.append("g")
        .attr("class", "x-axis");


    // scale for y axis:
    var yScale = d3v5.scaleLinear().range([height, 0]);
    // function for y axis
    var yAxis = g => g
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3v5.axisLeft(yScale));
    // Add the Y Axis element
    svg.append("g")
        .attr("class", "y-axis");



    // define the line
    var valueLine = d3v5.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.Value); });


    drawLineGraph.update = update;



    function update(countryName) {

        let t = d3v5.transition().duration(750);

        console.log("In de update van de line graph");
        countryDataTotal = dataHere.filter(d => d.COU == countryName && d.Variable == "Total population at birth");
        console.log(countryDataTotal);

        var ageMax = d3v5.max(countryDataTotal, d => d.Value);

        let scaleFactor = 1.1;
        yScale.domain([0, ageMax * scaleFactor]);


        svg.selectAll(".line").remove();

        var line = svg.selectAll(".line")
            .data([countryDataTotal]).attr("class", "line");

        line.transition().duration(1500)
            .attr("d",line)

        line.enter().append("path")
            .attr("class", "line")
            .attr("d", valueLine);

        svg.selectAll(".y-axis").transition(t).call(yAxis);

        svg.selectAll(".x-axis").transition(t).call(xAxis);


    }

    // einde line graph
}






function drawMap(dataset, year) {
    drawMap.update = update;
    // help from http://jsbin.com/kuvojohapi/1/edit?html,output



    var dataHere = dataset;

    var defaultFillColor = '#B8B8B8';
    var colorScale = d3v5.scaleLinear()
    .range(['#f03b20','#ffeda0'])


    var colorMap = {};
    dataHere.forEach(function(item) {
      var iso = item.COU;
      var value = item.Value;
      colorMap[iso] = { numberOfThings: value, fillColor: defaultFillColor }
    });


    var map = new Datamap({
    element: document.getElementById("mapContainer"),
    done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography, data) {
                    // console.log("data:");
                    // console.log(data);
                    console.log("geography:");
                    console.log(geography);
                    drawLineGraph.update(geography.id);
                    // console.log("de overeenkomende data:");
                    // console.log(dataHere.filter( d => d.COU == geography.id ));
                });
            },
    geographyConfig: {
        highlightFillColor: function(data) {
            if (data && data.fillColor != null) {
                return data.fillColor;
            } else {
                return defaultFillColor;
            };
        },
        highlightBorderColor: "#303030",
        popupTemplate: function(geo, data) {
            if (!data || !data.numberOfThings ){

                return ['<div class="hoverinfo"><strong>',
                        geo.properties.name,
                        ': ' + "no data",
                        '</strong></div>'].join('');
            } else {

                return ['<div class="hoverinfo"><strong>',
                        geo.properties.name,
                        ': ' + data.numberOfThings,
                        '</strong></div>'].join('');
            }
        }
    },
    data: colorMap,


    fills: { defaultFill: defaultFillColor },
    });


    // hier nog even de legenda
    // Scale needed for the color legend.
    var dataToLegendScale = d3v5.scaleLinear()
    .range([legendHeight, 0]);


    // set the color axis
    var legendScale = d3v5.scaleLinear()
      .range(['#f03b20','#ffeda0'])
      .domain([0, legendHeight]);

    // set a function for the color axis:
    var legendAxis = g => g
      .attr("transform", "translate(" + ( margin.left + legendWidth ) +"," + (h - margin.bottom - legendHeight) + ")")
      .call(d3v5.axisRight(dataToLegendScale));

    // Add an element to the svg for the x-axis.

    svg = d3v5.select(".datamap");

    svg.append("g")
      .attr("class", "colorAxis");

    svg.selectAll(".colorAxis")
      .append("text")
      .attr("x", - legendWidth)
      .attr("y", - 16)
      .style("text-anchor", "start")
      .style("fill", "black")
      .text("life expectancy");





    var pallete = svg.append('g')
      .attr('id', 'pallete');


    var legendData = []
    for (i = 0; i <= 1; i = i + 0.05){
        legendData.push(i * legendHeight);
    }

    var colorBar = pallete.selectAll('rect').data(legendData);
    colorBar.enter().append('rect')
      .attr('fill', function(d) {
        return legendScale(d);
      })
      .attr('x', margin.left )
      .attr('y', function(d, i) {
          return h - margin.bottom - (i + 1) * (legendHeight / legendData.length);
      })
      .attr('width', legendWidth )
      .attr('height', legendHeight / legendData.length);





    update(year, 0);


    function update(year, speed) {

        let t = d3v5.transition().duration(speed);

        console.log("in the update function!");
        let yearData = dataHere.filter( d => (d.Year == year) );

        var ageMax = d3v5.max(yearData, d => d.Value);
        var ageMin = d3v5.min(yearData, d => d.Value);

        // For the colors of the countries/
        colorScale.domain([ageMin, ageMax]);

        // Set the axis of the legend.
        dataToLegendScale.domain([ageMin, ageMax]);
        svg.selectAll(".colorAxis").transition(t).call(legendAxis);







        //colorMap = {};
        console.log("hier");
        console.log(colorMap);



        // Set all colors back to grey
        Object.values(colorMap).forEach(function(d) {
          d.numberOfThings = null;
          d.fillColor = defaultFillColor;
        });


        // and update the countries that have data
        yearData.forEach(function(item) {
            var iso = item.COU;
            var value = item.Value;
            colorMap[iso] = { numberOfThings: value, fillColor: colorScale(value) }
        });


        map.updateChoropleth(colorMap);


        // en hier nog even de legenda updaten

        };


}
