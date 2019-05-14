var w = 900;
var h = 600;

const labels = ["GDP", "% children (0-17) in violent areas", "Births per 1000 women aged 15-19",  "wealth share of top 10%",   ]

// Make sure these are reflected in line 33




window.onload = function() {


  var teensInViolentArea = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.CWB11/all?startTime=2010&endTime=2017"
  var teenPregnancies = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.CWB46/all?startTime=2009&endTime=2016"
  var top1Share = "https://stats.oecd.org/SDMX-JSON/data/WEALTH/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.ST10.TP/all?startTime=2009&endTime=2016"
  var GDP = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA.B1_GE.HCPC/all?startTime=2012&endTime=2018&dimensionAtObservation=allDimensions"
  var socialSpending = "https://stats.oecd.org/SDMX-JSON/data/SOCX_AGG/AUS+AUT+BEL+CAN+CHL+DNK+EST+FIN+FRA+DEU+GRC+HUN+IRL+ITA+JPN+KOR+LVA+LUX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+GBR+USA./all?startTime=2009&endTime=2016"

  var requests = [d3.json(teensInViolentArea), d3.json(teenPregnancies), d3.json(top1Share), d3.json(GDP)];

  Promise.all(requests).then(function(response) {

      var teensInViolenceBetter = transformResponse(response[0]);
      var teenPregBetter = transformResponse(response[1]);
      var top1Better = transformResponse(response[2]);
      var GDPBetter = transformResponse(response[3]);

      // the order is [x, y, colored, radius]
      var results = mergeData([GDPBetter, teensInViolenceBetter, teenPregBetter, top1Better]);

      scatter(results[0], results[1], results[2], labels);
      console.log(d3.select("#yearSelect").property("value"));
      scatter.update(d3.select("#yearSelect").property("value"));

      var select = d3.select("#yearSelect")
      .style("border-radius", "5px")
      .on("change", function() {
          scatter.update(this.value)
      });


  }).catch(function(e){
      throw(e);
  });

};








function scatter(dataset, years, countries, labels) {



  var margin = {
      left: 50,
      right: 30,
      top: 30,
      bottom: 40
  };

  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;

  svg = d3.select("svg").attr("width", w).attr("height", h);



  var options = d3.select("#yearSelect").selectAll("option")
      .data(years.reverse())
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

console.log(countries);
console.log(countries.length);
  var colScale = d3.scaleOrdinal()
    .domain(countries)
    .range(["#c75d27",
"#616ddb",
"#59c142",
"#a654c9",
"#89ba3d",
"#d63d8a",
"#55c974",
"#d380d2",
"#41922e",
"#8457a1",
"#b2b72d",
"#6b86c9",
"#d89c33",
"#4ab3d2",
"#d64243",
"#56c4a5",
"#a14a77",
"#369657",
"#e3829e",
"#6d8c2e",
"#ad4f50",
"#83b26f",
"#df936b",
"#367e5c",
"#92692d",
"#5c7237",
"#b5ae5e",
"#6a701d"]);
  // scale for the color
  var c = d3.scaleLinear()
      .range(["deepskyblue", "gold"]);

  var cFunction = function(d) {
    console.log(d.Country);
    return colScale[d.Country];
  }


  // scale for the radius
  var minRadius = 4;
  var maxRadius = 36;
  var r = d3.scaleLinear()
      .range([minRadius, maxRadius]);



  svg.selectAll(".x-axis")
      .append("text")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("fill", "black")
      .text(labels[0]);

  svg.selectAll(".y-axis")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("fill", "black")
      .text(labels[1])


  var line = svg.append("line")
        .attr("class", "regression");


  var tooltip = d3.select("body").append("div").attr("class", "tooltip");
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



update(d3.select("#yearSelect").property("value"))

  function update(year) {
    var t = d3.transition().duration(750);
    // even tijdelijk

    var yearData = dataset.filter(d => d.Time == year);


    yearData = yearData.filter(d => (d.Datapoint[0]) && (d.Datapoint[0] === d.Datapoint[0])
                                  && (d.Datapoint[1]) && (d.Datapoint[1] === d.Datapoint[1]))
    console.log("deze gaan we tekenen:");
    console.log(yearData);


    var maxX = d3.max(yearData, d => d.Datapoint[0]);
    var maxY = d3.max(yearData, d => d.Datapoint[1]);
    var maxC = d3.max(yearData, d => d.Datapoint[2]);
    var maxR = d3.max(yearData, d => d.Datapoint[3]);

    var minX = d3.min(yearData, d => d.Datapoint[0]);
    var minY = d3.min(yearData, d => d.Datapoint[1]);
    var minC = d3.min(yearData, d => d.Datapoint[2]);
    var minR = d3.min(yearData, d => d.Datapoint[3]);


    if (!maxX) {
        maxX = 1;
    }
    if (!maxY) {
        maxY = 1;
    }
    if (!maxC) {
        maxC = 1;
    }
    if (!maxR) {
        maxR = 1;
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
    if (!minR) {
        minR = 0;
    }


    console.log("max x en y en c en r");
    console.log(maxX);
    console.log(maxY);
    console.log(maxC);
    console.log(maxR);

    // the scalefactor makes the plot slightly bigger than the max values
    var scaleFactor = 1.05
    x.domain([0, maxX * scaleFactor]);
    y.domain([0, maxY * scaleFactor]);
    c.domain([minC, maxC]);
    r.domain([minR, maxR]);


    svg.selectAll(".y-axis").transition(t).call(yAxis);
    svg.selectAll(".x-axis").transition(t).call(xAxis);


    var xFunction = function(d) {
      if (d.Datapoint[0] == null) {
          return margin.left + x(0);
      };
      return margin.left + x(d.Datapoint[0]);
    }

    var yFunction = function(d) {
      if (d.Datapoint[1] == null) {
          return margin.top + y(0);
      };
      return margin.top + y(d.Datapoint[1]);
    }



    var rFunction = function(d) {
      if (d.Datapoint[3] == null) {
          return r(minR);
      };
      return r(d.Datapoint[3]);
    }


    var circle = svg.selectAll("circle").data(yearData);

    circle.exit().remove();

    circle.enter().append("circle")
        .attr("class", "circle")
        .merge(circle)
        .transition(t)
        .attr("cx", function(d) {
          return xFunction(d)
        })
        .attr("cy", function(d) {
          return yFunction(d)
        })
        .attr("fill", function(d) {
          return colScale(d.Country)
        })
        .attr("r", function(d) {
          return rFunction(d)
        });



      var regression = getRegression();
      console.log("dit komt eruit");
      console.log(y(regression(minX)));

      console.log("eens kijken");
      console.log(y(regression(0)))
      console.log(y(regression(maxX)))



      line.merge(line).transition(t)
          .attr("stroke-width", 2)
          .attr("stroke", "black")

          .attr("x1", margin.left + x(0))
          .attr("y1", margin.top + y(regression(0)))
          .attr("x2", margin.left + x(maxX))
          .attr("y2", margin.top + y(regression(maxX)));


      mouseOver();



      function getRegression() {
        let regressionData = yearData.filter(d => (d.Datapoint[0]) && (d.Datapoint[0] === d.Datapoint[0]) && (d.Datapoint[1]) && (d.Datapoint[1] === d.Datapoint[1]));
        console.log("selected data:")
        console.log(regressionData);
        // based on https://bl.ocks.org/ctufts/298bfe4b11989960eeeecc9394e9f118
        let totalX = 0;
        let totalY = 0;
        let n = regressionData.length;
        let xMean = 0;
        let yMean = 0;
        let term1 = 0;
        let term2 = 0;

        for (i = 0; i < n; i++) {
            totalX += regressionData[i].Datapoint[0];
            totalY += regressionData[i].Datapoint[1];
        };
        xMean = totalX / n;
        yMean = totalY / n;
        console.log("xmean: " + xMean );
        console.log("ymean: " + yMean);

        // calculate coefficients
        var xr = 0;
        var yr = 0;
        for (i = 0; i < n; i++) {
            // console.log(regressionData[i].Datapoint[0])
            // console.log(regressionData[i].Datapoint[1])
            // console.log("jaaaaaaaaaaaaaaaaaaaaa");
            xr = regressionData[i].Datapoint[0] - xMean;
            yr = regressionData[i].Datapoint[1] - yMean;
            term1 = term1 + xr * yr;
            term2 = term2 + xr * xr;
        };
        console.log(term1);
        console.log(term2);


        var slope = term1 / term2;
        var b = yMean - (slope * xMean);

        if ( b !== b || slope !== slope) {
          b = 0;
          slope = 0;
        }
        console.log("b = " + b +  " slope = " + slope);
        return function (d) {
          return b + (d * slope)
        }




      };



      function mouseOver() {


        // Show the tooltip when the user mouses over the bars.
        var circle = svg.selectAll(".circle").data(yearData)
        var oldR;
        circle.on("mousemove", function(d) {
                tooltip.style("left", (d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY - 200) + "px")
                    .style("display", "inline-block")
                    .html(d.Country + "<br>" + labels[0] + ":<br>" + (Math.round(d.Datapoint[0]*100)/100) + "<br>" + labels[1] +":<br>" + (Math.round(d.Datapoint[1]*100)/100) + "<br>" + labels[2] + ":<br>" + (Math.round(d.Datapoint[2]*100)/100) + "<br>" + labels[3] + ":<br>" + (Math.round(d.Datapoint[3]*100)/100) );
                d3.select(this).attr("r", function(d) {
                  return rFunction(d) * 1.4;
                });
            })
            .on("mouseout", function(d) {
                tooltip.style("display", "none");
                d3.select(this)
                .transition(t)
                .attr("fill", function(d) {
                  return colScale(d.Country)
                })
                .attr("r", function(d) {
                  return rFunction(d)
                });
            });
      };


  }

  scatter.update = update;






};









function mergeData(dataArray) {
  // returns [results, years, countries]

  // Here we just merge all data together in an object with country as key, an array with data as value.
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


      let a = dataArray[0][countries[j]];
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


      let b = dataArray[1][countries[j]];
      if (b) {

        b = b.filter(d => (d.Time == years[i]) );
        if (b[0]) {
          b = b[0].Datapoint;
        } else {
          b = null;
        }

      } else {
        b = null;
      }


      let c = dataArray[2][countries[j]];
      if (c) {

        c = c.filter(d => (d.Time == years[i]) );
        if (c[0]) {
          c = c[0].Datapoint;
        } else {
          c = null;
        }

      } else {
        c = null;
      };


      let d = dataArray[3][countries[j]];
      if (d) {

        d = d.filter(d => (d.Time == years[i]) );
        if (d[0]) {
          d = d[0].Datapoint;
        } else {
          d = null;
        }

      } else {
        d = null;
      };


      var datapoint = [a, b, c, d];

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


  // get the time periods
  let observation;
  if (seriesBool){
    observation = data.structure.dimensions.observation[0];
    // also add the time periods as a variable
    varArray.push(observation);
  } else {
    observation = data.structure.dimensions.observation[data.structure.dimensions.observation.length - 1];
    varArray.push(observation);
  };


  // this is an object with all combinations of the 0:0:0 format.
  // They don't necessarily all have a value, but they are all possible datapoints.
  let strings = Object.keys(dataHere);


  // the output object has country as key and an array as value
  let dataObject = {};

  // for every possible string we made:
  strings.forEach(function(string) {
    // for each observation and its index
    observation.values.forEach(function(observ, index){

      // get the values of the observations
      let datapoint;
      if (seriesBool){
        datapoint = dataHere[string].observations[index];
        // console.log(dataHere[string])
      } else {
        datapoint = dataHere[string];
        // console.log(dataHere[string])
      };

      if (datapoint != undefined) {
        // console.log(datapoint);

        // make a temporary object
        let tempObj = {};

        // take all numbers from the string
        let tempString;
        if (seriesBool) {
          tempString = string.split(":").slice(0,-1);
        } else {
          tempString = string.split(":");
        };

        // I think here we set names and explanations of variables?
        tempString.forEach(function(s, indexi) {
          // name of the variable will be the key, value will be the value
          tempObj[varArray[indexi].name] = varArray[indexi].values[s].name;

        });

        // Every datapoint also needs a timestamp and actual datapoint
        if (seriesBool) {
          tempObj["Time"] = observ.name;
        } else {
          tempObj["Time"] = tempObj["Year"];
        };

        // console.log(tempObj);
        if (seriesBool){
          tempObj["Datapoint"] = datapoint[0];
        } else {
          tempObj["Datapoint"] = datapoint[0];
        };

        if (seriesBool){
          tempObj["Indicator"] = originalData.structure.dimensions.series[1].values[0].name;
        }
        // else {
        //   tempObj["Indicator"] = originalData.structure.dimensions.observation[1].values[0].name;
        // }

        // Add the temporary object to thte total object
        if (dataObject[tempObj["Country"]] == undefined) {
          dataObject[tempObj["Country"]] = [tempObj];
        } else if (seriesBool) {
          dataObject[tempObj["Country"]].push(tempObj);
        } else if (!seriesBool && (dataObject[tempObj["Country"]][dataObject[tempObj["Country"]].length - 1]["Year"] != tempObj["Year"]) ) {
          dataObject[tempObj["Country"]].push(tempObj);
        };
      };
    });
  });
  return dataObject;
};




function concatData(dataArray) {
  var result = [];
  let key;

  for (var i = 0; i < dataArray.length; i++) {
    for (key in dataArray[i]) {
      for (var j = 0; j < dataArray[i][key].length; j++){
        result.push(dataArray[i][key][j]);
      };
    };
  };
  return result;
};
