var w = 900;
var h = 600;

// The order of line 5 and line 29  (var results) have to match.
const labels = ["GDP ($)", "births per 1000 women aged 15-19", "annual hours worked", "children (aged 0-17) in violent areas (%)"];



window.onload = function() {


  var teensInViolentArea = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.CWB11/all?startTime=2009&endTime=2016"
  var teenPregnancies = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.CWB46/all?startTime=2009&endTime=2016"
  var GDP = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.B1_GE.HCPC/all?startTime=2009&endTime=2016&dimensionAtObservation=allDimensions"
  var hoursWorked = "https://stats.oecd.org/SDMX-JSON/data/ANHRS/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OECD+CRI+RUS.TE.A/all?startTime=2009&endTime=2016&dimensionAtObservation=allDimensions&pid=7fbec742-4ead-42fd-b08e-42905657c4b6"


  var requests = [d3.json(teensInViolentArea), d3.json(teenPregnancies), d3.json(GDP), d3.json(hoursWorked)];

  Promise.all(requests).then(function(response) {

      var teensInViolenceBetter = transformResponse(response[0]);
      var teenPregBetter = transformResponse(response[1]);
      var GDPBetter = transformResponse(response[2]);
      var hoursWorkedBetter = transformResponse(response[3]);

      // The order of line 5 and line 29 have to match.
      // Index 0 will be x-axis, 3 will be color.
      var results = mergeData([GDPBetter, teenPregBetter, hoursWorkedBetter, teensInViolenceBetter]);


      scatter(results[0], results[1], results[2], labels);

      scatter.update(d3.select("#yearSelect").property("value"), d3.select("#yVarSelect").property("value"));

      var yearSelect = d3.select("#yearSelect")
      .style("border-radius", "5px")
      .on("change", function() {
          scatter.update(this.value, d3.select("#yVarSelect").property("value"));
      });

      var yVarSelect = d3.select("#yVarSelect")
      .style("border-radius", "5px")
      .on("change", function() {
          scatter.update(d3.select("#yearSelect").property("value"), this.value);
      });


  }).catch(function(e){
      throw(e);
  });

};



function scatter(dataset, years, countries, labels) {

  var margin = {
      left: 40,
      right: 30,
      top: 30,
      bottom: 100
  };

  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  svg = d3.select("#main").attr("width", w).attr("height", h);


  var yearOptions = d3.select("#yearSelect").selectAll("option")
      .data(years.reverse())
      .enter().append("option")
      .text(d => d);

  var yOptions = d3.select("#yVarSelect").selectAll("option")
      .data(labels.slice(1,3))
      .enter().append("option")
      .text(d => d);


  // Set the x-axis.
  var x = d3.scaleLinear()
      .range([0, width]);
  // set a function for the x axis:
  var xAxis = g => g
      .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
      .call(d3.axisBottom(x))
  // Add an element to the svg for the x-axis.
  svg.append("g")
      .attr("class", "x-axis")


  // scale for the y axis
  var y = d3.scaleLinear()
      .range([height, 0]);
  // set a function for the y axis:
  var yAxis = g => g
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(d3.axisLeft(y))
  // Add an element to the svg for the y-axis.
  svg.append("g")
      .attr("class", "y-axis");


  // Scale for the colors on the dots.
  var c = d3.scaleLinear()
    .range(['#ffeda0','#f03b20']);



  svg.selectAll(".x-axis")
      .append("text")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "black")
      .text(labels[0]);


  svg.selectAll(".y-axis")
      .append("text")
      .attr("class", "text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "black")


  var line = svg.append("line")
        .attr("class", "regression");


  var tooltip = d3.select(".tooltip");

  // Scale needed for the color legend.
  var dataToLegendScale = d3.scaleLinear()
    .range([0, width]);


  // set the color axis
  var legendScale = d3.scaleLinear()
      .range(['#ffeda0','#f03b20'])
      .domain([0, width]);

  // set a function for the color axis:
  var colorAxis = g => g
      .attr("transform", "translate(" + margin.left + "," + (h - margin.bottom / 4) + ")")
      .call(d3.axisBottom(dataToLegendScale))

  // Add an element to the svg for the x-axis.
  svg.append("g")
      .attr("class", "colorAxis")



  svg.selectAll(".colorAxis")
      .append("text")
      .attr("x", width)
      .attr("y", -16)
      .style("text-anchor", "end")
      .style("fill", "black")
      .text([labels[3]])


  var pallete = svg.append('g')
    .attr('id', 'pallete');


  var legendData = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(x => x * width);
  var colorHeight = 8
  var swatch = pallete.selectAll('rect').data(legendData);
  swatch.enter().append('rect')
    .attr('fill', function(d) {
      return legendScale(d);
    })
    .attr('x', function(d, i) {
      return margin.left + i * (width / legendData.length);
    })
    .attr('y', h - margin.bottom / 4 - colorHeight)
    .attr('width', width / legendData.length)
    .attr('height', colorHeight);




  update(yearOptions.property("value"), yOptions.property("value") )


  function update(year, yVar) {

    var xIndex = 0;
    var yIndex = labels.indexOf(yVar);
    var colorIndex = 3;


    var t = d3.transition().duration(750);

    var yearData = dataset.filter(d => d.Time == year);


    yearData = yearData.filter(d => ((d.Datapoint[xIndex]) && d.Datapoint[xIndex] === d.Datapoint[xIndex])
                                 && ( (d.Datapoint[yIndex]) && d.Datapoint[yIndex] === d.Datapoint[yIndex]))


    var maxX = d3.max(yearData, d => d.Datapoint[xIndex]);
    var maxY = d3.max(yearData, d => d.Datapoint[yIndex]);
    var maxC = d3.max(yearData, d => d.Datapoint[colorIndex]);


    var minX = d3.min(yearData, d => d.Datapoint[xIndex]);
    var minY = d3.min(yearData, d => d.Datapoint[yIndex]);
    var minC = d3.min(yearData, d => d.Datapoint[colorIndex]);


    if (!maxX) {
        maxX = 1;
    }
    if (!maxY) {
        maxY = 1;
    }
    if (!maxC) {
        maxC = 0;
    }

    if (!minX) {
        minX = 0;
    }
    if (!minY) {
        minY = 0;
    }
    if (!minC) {
        minC = 0;
    }


    // The scalefactor makes the plot slightly bigger than the max values.
    var scaleFactor = 1.05
    x.domain([0, maxX * scaleFactor]);
    y.domain([0, maxY * scaleFactor]);
    c.domain([minC, maxC])

    dataToLegendScale.domain([minC, maxC]);

    svg.selectAll(".y-axis").transition(t).call(yAxis).select(".text")
        .text(labels[yIndex]);
    svg.selectAll(".x-axis").transition(t).call(xAxis);
    svg.selectAll(".colorAxis").transition(t).call(colorAxis);




    var xFunction = function(d) {
      if (d.Datapoint[xIndex] == null) {
          return margin.left + x(0);
      };
      return margin.left + x(d.Datapoint[xIndex]);
    }

    var yFunction = function(d) {
      if (d.Datapoint[yIndex] == null) {
          return margin.top + y(0);
      };
      return margin.top + y(d.Datapoint[yIndex]);
    }

    var cFunction = function(d) {
      if (d.Datapoint[colorIndex] == null) {
          return c(minC);
      };
      return c(d.Datapoint[colorIndex]);
    }



    var circle = svg.selectAll("circle").data(yearData);

    circle.exit().remove();

    circle.enter().append("circle")
        .attr("class", "circle")
        .style("stroke", "#333333")
        .style("stroke-width", "2")
        .merge(circle)
        .transition(t)
        .attr("cx", function(d) {
          return xFunction(d)
        })
        .attr("cy", function(d) {
          return yFunction(d)
        })
        .attr("fill", function(d) {
          return cFunction(d)
        })
        .attr("r", 8);


      var regression = getRegression();


      line.merge(line).transition(t)
          .attr("stroke-width", 2)
          .attr("stroke", "#404040")
          .attr("x1", margin.left + x(0))
          .attr("y1", margin.top + y(regression(0)))
          .attr("x2", margin.left + x(maxX))
          .attr("y2", margin.top + y(regression(maxX)));


      mouseOver();



      function getRegression() {
        // Least squares method.
        // Based on https://bl.ocks.org/ctufts/298bfe4b11989960eeeecc9394e9f118

        // Don't use empty datapoints.
        let regressionData = yearData.filter(d => (d.Datapoint[xIndex]) && (d.Datapoint[xIndex] === d.Datapoint[xIndex]) && (d.Datapoint[yIndex]) && (d.Datapoint[yIndex] === d.Datapoint[yIndex]));


        let totalX = 0;
        let totalY = 0;
        let n = regressionData.length;
        let xMean = 0;
        let yMean = 0;
        let term1 = 0;
        let term2 = 0;

        for (i = 0; i < n; i++) {
            totalX += regressionData[i].Datapoint[xIndex];
            totalY += regressionData[i].Datapoint[yIndex];
        };
        xMean = totalX / n;
        yMean = totalY / n;


        // Calculate coefficients.
        var xr = 0;
        var yr = 0;
        for (i = 0; i < n; i++) {
            xr = regressionData[i].Datapoint[xIndex] - xMean;
            yr = regressionData[i].Datapoint[yIndex] - yMean;
            term1 = term1 + xr * yr;
            term2 = term2 + xr * xr;
        };


        var slope = term1 / term2;
        var b = yMean - (slope * xMean);

        if ( b !== b || slope !== slope) {
          b = 0;
          slope = 0;
        }
        return function (d) {
          return b + (d * slope)
        }

      };


      function mouseOver() {

        // Show the tooltip when the user mouses over the bars.
        var circle = svg.selectAll(".circle");
        var oldR;
        circle.on("mousemove", function(d) {
                tooltip.style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 120) + "px")
                    .style("display", "inline-block")
                    .html("<b>" + d.Country + "</b>" + "<br>" + labels[xIndex] + ": <b>" + (Math.round(d.Datapoint[xIndex]*100)/100) + "</b> <br>" + labels[yIndex] +": <b>" + d.Datapoint[yIndex] + "</b> <br>" + labels[colorIndex] + ": <b>" + d.Datapoint[colorIndex]) + "</b>";
                d3.select(this).attr("r", 16);
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none");
                d3.select(this)
                .transition(t)
                .attr("r", 8);
            });
      };


  }

  scatter.update = update;

};



function mergeData(dataArray) {
  // Returns [results, years, countries]
  // Here we merge all data together in an object with country as key, an array with data as value.

  var countries = new Set();
  for (var i = 0; i < dataArray.length; i++) {
    Object.keys(dataArray[i]).forEach(function(d) {
      countries.add(d);
    });


  };
  countries = [...countries].sort();



  var years = new Set();
  for (var i = 0; i < dataArray.length; i++) {
    Object.values(dataArray[i]).forEach(function(d) {
      for (var j = 0; j < d.length; j++) {
        years.add(d[j].Time);
      };
    });
  };
  years = [...years].sort();


  var results = []

  for (var i = 0; i < years.length; i++) {

    for (var j = 0; j < countries.length; j++) {
      temp = {}


      var datapoint = [];

      for (k = 0; k < dataArray.length; k++){
        let a = dataArray[k][countries[j]];
        if (a) {

          a = a.filter(d => (d.Time == years[i]) );
          if (a[0]) {
            a = a[0].Datapoint;
          } else {
            a = null;
          }

        } else {
          a = null;
        }

        datapoint.push(a);
      }


      temp["Time"] = years[i];
      temp["Country"] = countries[j];
      temp["Datapoint"] = datapoint;

      results.push(temp);

    };

  };
return [results, years, countries];
};




function transformResponse(data) {
  // This function is mostly a combination of the transformResponse examples at
  // https://data.mprog.nl/course/10%20Homework/100%20D3%20Scatterplot/scripts/transformResponseV1.js
  // and https://data.mprog.nl/course/10%20Homework/100%20D3%20Scatterplot/scripts/transformResponseV2.js

  // Save the data.
  let originalData = data;
  console.log(originalData);


  let seriesBool = false;
  if (data.dataSets[0].series) {
    seriesBool = true;
  }


  // This is the actualy data, the numbers.
  let datahere;
  if (seriesBool) {
    dataHere = data.dataSets[0].series;
  } else {
    dataHere = data.dataSets[0].observations;
  }


  // Get the variables and their possible values.
  let series;
  if (seriesBool){
    series = data.structure.dimensions.series;
  } else {
    series = data.structure.dimensions.observation;
  }


  let varArray = [];
  let lenArray = [];

  series.forEach(function(serie) {
    varArray.push(serie);
    lenArray.push(serie.values.length);
  });


  // Get the time periods.
  let observation;
  if (seriesBool){
    observation = data.structure.dimensions.observation.filter(d => d.id == "TIME_PERIOD")[0];
    // Also add the time periods as a variable.
    varArray.push(observation);
  } else {
    observation = data.structure.dimensions.observation.filter(d => d.id == "TIME_PERIOD")[0];
  };

  // This is an object with all combinations of the 0:0:0 format.
  // They don't necessarily all have a value, but they are all possible datapoints.
  let strings = Object.keys(dataHere);

  // The output object has country as key and an array as value.
  let dataObject = {};

  strings.forEach(function(string) {

    // For each observation (a time) and its index.
    observation.values.forEach(function(observ, index){

      // Get the data of the observations.
      let datapoint;
      if (seriesBool){
        datapoint = dataHere[string].observations[index];
      } else {
        datapoint = dataHere[string];
      };

      if (datapoint != undefined) {

        let tempObj = {};

        // Take all numbers from the string.
        let tempString;
        if (seriesBool) {
          tempString = string.split(":").slice(0,-1);
        } else {
          tempString = string.split(":");
        };


        tempString.forEach(function(s, indexi) {
          tempObj[varArray[indexi].name] = varArray[indexi].values[s].name;
        });

        // Every datapoint also needs a timestamp and actual datapoint.
        if (seriesBool) {
          tempObj["Time"] = observ.name;
        } else {
          if (tempObj["Year"]) {
            tempObj["Time"] = tempObj["Year"];
          } else {
            tempObj["Time"] = tempObj["Time"];
          }
        };


        if (seriesBool){
          tempObj["Datapoint"] = datapoint[0];
        } else {
          tempObj["Datapoint"] = datapoint[0];
        };

        if (seriesBool){
          tempObj["Indicator"] = originalData.structure.dimensions.series[1].values[0].name;
        }


        // Add the temporary object to the total object.
        if (dataObject[tempObj["Country"]] == undefined) {
          dataObject[tempObj["Country"]] = [tempObj];
        } else if (seriesBool) {
          dataObject[tempObj["Country"]].push(tempObj);
        } else if (!seriesBool && (dataObject[tempObj["Country"]][dataObject[tempObj["Country"]].length - 1]["Time"] != tempObj["Time"]) ) {
          dataObject[tempObj["Country"]].push(tempObj);
        };
      };
    });
  });
  return dataObject;
};
