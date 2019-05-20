var w = 800;
var h = 600;

const YEAR = 2014;

window.onload = function() {


  var requests = [d3v5.json("data/gini_after.json"), d3v5.json("data/life_expectancy.json")]

  Promise.all(requests).then(function(response) {


    console.log(response[0]);
    console.log(response[1]);

    var years = new Set();

    for (i = 0; i < response[0].length; i++) {
      years.add(response[0][i].TIME);
    }
    years = Array.from(years);
    years.sort();

    var yearOptions = d3v5.select("#yearSelect").selectAll("option")
        .data(years.reverse())
        .enter().append("option")
        .text(d => d);





    drawMap(response[0], yearOptions.property("value"));
    console.log(response[0]);

    var yearOptions = d3v5.select("#yearSelect").on("change", function() {
        drawMap.update(this.value);
    });

    // einde promise -> then function
  });


// einde onload
};



function drawMap(dataset, year) {
  drawMap.update = update;
  // help from http://jsbin.com/kuvojohapi/1/edit?html,output

  var dataHere = dataset.filter( d => (d.TIME == year) );

  var giniMax = d3v5.max(dataHere, d => d.Value);
  var giniMin = d3v5.min(dataHere, d => d.Value);

  var colorMap = {};


  var colorScale = d3v5.scaleLinear()
    .range(['#ffff4d','#ff4d4d'])
    .domain([0,1]);


  dataHere.forEach(function(item) {
      var iso = item.LOCATION;
      var value = item.Value;
      colorMap[iso] = { numberOfThings: value, fillColor: colorScale(value) }
  });



  var map = new Datamap({
    element: document.getElementById("mapContainer"),
    done: function(datamap) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography, data) {
                    console.log("data:");
                    console.log(data);
                    console.log("geography:");
                    console.log(geography);
                    console.log("de overeenkomende data:");
                    console.log(dataHere.filter( d => d.LOCATION == geography.id ));
                });
            },
  data: colorMap,
  highlightFillColor: function(geo) {
                return geo['fillColor'];
            },
  // default color
  fills: { defaultFill: '#989898' },



  });


  function update(year) {
    console.log("in the update function!");
    dataHere = dataset.filter( d => (d.TIME == year) );
    dataHere = dataset.filter( d => (d.TIME == year) );

    giniMax = d3v5.max(dataHere, d => d.Value);
    giniMin = d3v5.min(dataHere, d => d.Value);

    colorMap = {};


    colorScale.domain([0,1]);


    dataHere.forEach(function(item) {
        var iso = item.LOCATION;
        var value = item.Value;
        colorMap[iso] = { numberOfThings: value, fillColor: colorScale(value) }
    });

    map.updateChoropleth(colorMap);

  };


}
