var w = 800;
var h = 600;



window.onload = function() {


  var requests = [d3v5.json("data/gini_after.json"), d3v5.json("data/life_expectancy.json")]

  Promise.all(requests).then(function(response) {


    console.log(response[0]);
    console.log(response[1]);

    var map = new Datamap({element: document.getElementById("mapContainer")});

    // einde promise -> then function
  });


// einde onload
};



function drawMap(dataset, years, countries, labels) {

}
