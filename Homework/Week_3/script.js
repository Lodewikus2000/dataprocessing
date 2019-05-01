const COLUMN = "Werkloosheidspercentage/Niet seizoengecorrigeerd (%)";

console.log("Hello world!");
var fileName = "data.json";
var txtFile = new XMLHttpRequest();

txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        var data = JSON.parse(txtFile.responseText);
        myFunction(data);
    }
}

txtFile.open("GET", fileName);
txtFile.send();

function myFunction(json) {
    KEYS = Object.keys(json);
    console.log(Object.keys(json));

    KEYS.forEach(function(element) {
      console.log(json[element][COLUMN]);
    });


    const canvas = document.getElementById("graph");
    const ctx = canvas.getContext("2d");
    var CANVAS_WIDTH = 900;
    var CANVAS_HEIGHT = 600;

    var OFFSET = 60;
    var GRAPH_TOP = OFFSET;
    var GRAPH_BOTTOM = CANVAS_HEIGHT - OFFSET;
    var GRAPH_LEFT = OFFSET;
    var GRAPH_RIGHT = CANVAS_WIDTH - OFFSET;;

    var GRAPH_HEIGHT = CANVAS_HEIGHT - 2 * OFFSET;
    var GRAPH_WIDTH = CANVAS_WIDTH - 2 * OFFSET;

    // Draw the axes
    ctx.beginPath();
    ctx.moveTo(GRAPH_RIGHT, GRAPH_BOTTOM);
    ctx.lineTo(GRAPH_LEFT, GRAPH_BOTTOM);
    ctx.lineTo(GRAPH_LEFT, GRAPH_TOP);
    ctx.stroke();

    var largestValue = 0;
    KEYS.forEach(function(element) {
      if (json[element][COLUMN] > largestValue){
        largestValue = json[element][COLUMN];
      }
    });
    console.log("largest value is: ");
    console.log(largestValue);



    xTrans = createTransform([0, KEYS.length], [GRAPH_LEFT, GRAPH_RIGHT]);
    yTrans = createTransform([0, largestValue], [GRAPH_BOTTOM, GRAPH_TOP]);


    // draw the x labels and helper lines
    ctx.font = '10px sans-serif';
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey"
    for (var i = 0; i < KEYS.length; i = i + 12 ){
      var label = KEYS[i];
      xPix = xTrans(i);
      ctx.fillText(label.substring(0,4), xPix-10, GRAPH_BOTTOM + 12);
      console.log(xPix, label);
      ctx.beginPath();
      ctx.moveTo(xPix, GRAPH_BOTTOM);
      ctx.lineTo(xPix, GRAPH_TOP);
      ctx.stroke()
    }





    // draw the y labels and helper lines
    ctx.font = '10px sans-serif';
    ctx.lineWidth = 1;
    ctx.strokeStyle = "grey"
    for (var i = 0; i < largestValue; i++){
      yPix = yTrans(i);
      ctx.fillText(i, GRAPH_LEFT - 10, yPix);
      console.log(yPix, label);
      ctx.beginPath();
      ctx.moveTo(GRAPH_LEFT, yPix);
      ctx.lineTo(GRAPH_RIGHT, yPix);
      ctx.stroke()
    }







    ctx.lineWidth = 2;
    var gradient = ctx.createLinearGradient(0, GRAPH_BOTTOM, 0, GRAPH_TOP);
    gradient.addColorStop("0.4", "blue");
    gradient.addColorStop("1.0", "red");

    // Fill with gradient
    ctx.strokeStyle = gradient;
    // ctx.strokeStyle = "black"
    ctx.beginPath();
    // Move the brush to the first point
    ctx.moveTo(GRAPH_LEFT, yTrans(json[KEYS[0]][COLUMN]))
    // Draw a line to every next point
    for (var i = 1; i < KEYS.length; i++){
      xPix = xTrans(i);
      yPix = yTrans(json[KEYS[i]][COLUMN]);
      ctx.lineTo(xPix, yPix);
    };
    ctx.stroke();















    ctx.font = '16px sans-serif';
    ctx.fillText("Month", (GRAPH_WIDTH / 2) + 0, CANVAS_HEIGHT - 10);
    ctx.translate(0, 0);
    ctx.rotate(- Math.PI / 2);
    ctx.fillText("Unemployment %", -(GRAPH_HEIGHT / 2) - 80, 20);
    ctx.restore();
}








function createTransform(domain, range){
    // domain is a two-element array of the data bounds [domain_min, domain_max]
    // range is a two-element array of the screen bounds [range_min, range_max]
    // this gives you two equations to solve:
    // range_min = alpha * domain_min + beta
    // range_max = alpha * domain_max + beta
    // a solution would be:

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
    // var alpha = (range_max - range_min) / (domain_max - domain_min)
    // var beta = range_max - alpha * domain_max
    //
    // // returns the function for the linear transformation (y= a * x + b)
    // return function(x){
    //   return alpha * x + beta;
    // }
    return function(x){
      return (x - domain_min) / (domain_max - domain_min) * (range_max - range_min) + range_min;
    }
}
