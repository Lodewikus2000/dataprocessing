const COLUMN = "Werkloosheidspercentage/Niet seizoengecorrigeerd (%)";

var fileName = "data.json";
var txtFile = new XMLHttpRequest();

txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        var data = JSON.parse(txtFile.responseText);
        drawGraph(data);
    }
}

txtFile.open("GET", fileName);
txtFile.send();


function drawGraph(json) {
    const KEYS = Object.keys(json);
    var VALUES = [];
    KEYS.forEach(function(value) {
      VALUES.push(json[value][COLUMN]);
    });

    const LARGEST_VALUE = Math.max(...VALUES);

    const canvas = document.getElementById("graph");
    const ctx = canvas.getContext("2d");

    // We need the default state of the canvas to keep drawing after rotation.
    ctx.save();

    var CANVAS_WIDTH = canvas.width;
    var CANVAS_HEIGHT = canvas.height;
    var OFFSET = 60;
    var GRAPH_TOP = OFFSET;
    var GRAPH_BOTTOM = CANVAS_HEIGHT - OFFSET;
    var GRAPH_LEFT = OFFSET;
    var GRAPH_RIGHT = CANVAS_WIDTH - OFFSET;
    var GRAPH_HEIGHT = CANVAS_HEIGHT - 2 * OFFSET;
    var GRAPH_WIDTH = CANVAS_WIDTH - 2 * OFFSET;


    xTrans = createTransform([0, KEYS.length], [GRAPH_LEFT, GRAPH_RIGHT]);
    yTrans = createTransform([0, LARGEST_VALUE], [GRAPH_BOTTOM, GRAPH_TOP]);

    drawAxes(ctx, GRAPH_LEFT, GRAPH_RIGHT, GRAPH_BOTTOM, GRAPH_TOP);

    drawHelperX(ctx, KEYS, xTrans, GRAPH_BOTTOM, GRAPH_TOP);
    drawHelperY(ctx, LARGEST_VALUE, yTrans, GRAPH_LEFT, GRAPH_RIGHT);

    drawLine(ctx, KEYS, VALUES, xTrans, yTrans, GRAPH_BOTTOM, GRAPH_TOP, GRAPH_LEFT);

    // Set the labels.
    ctx.font = '16px sans-serif';
    ctx.fillText("year", (GRAPH_WIDTH / 2) + 20, CANVAS_HEIGHT - 10);
    ctx.translate(0, 0);
    ctx.rotate(- Math.PI / 2);
    ctx.fillText("unemployment %", -(GRAPH_HEIGHT / 2) - 100, 26);
    ctx.restore();

    // Set the title.
    ctx.font = '24px sans-serif';
    ctx.fillText("Unemployment in the Netherlands", CANVAS_WIDTH / 2 - 200, 34);

    // Source.
    ctx.font = '10px sans-serif';
    ctx.fillText("Source: CBS", CANVAS_WIDTH - 100, CANVAS_HEIGHT - 10);
}


function createTransform(domain, range){
    // domain is a two-element array of the data bounds [domain_min, domain_max]
    // range is a two-element array of the screen bounds [range_min, range_max]
    var d_min = domain[0]
    var d_max = domain[1]
    var r_min = range[0]
    var r_max = range[1]

    return function(x){
      return (x - d_min) / (d_max - d_min) * (r_max - r_min) + r_min;
    }
}


function drawHelperX(context, keys, transFuncX, graphBottom, graphTop) {
  // draw the x helper lines and their labels
  context.font = '10px sans-serif';
  context.lineWidth = 1;
  context.strokeStyle = "grey"
  for (var i = 0; i < keys.length; i = i + 12 ){
    var label = keys[i];
    xPix = transFuncX(i);
    context.fillText(label.substring(0,4), xPix-10, graphBottom + 12);
    context.beginPath();
    context.moveTo(xPix, graphBottom);
    context.lineTo(xPix, graphTop);
    context.stroke()
  }
}


function drawHelperY(context, largestValue, transFuncY, graphLeft, graphRight) {
  // draw the y helper lines and their labels
  context.font = '10px sans-serif';
  context.lineWidth = 1;
  context.strokeStyle = "grey"
  for (var i = 0; i < largestValue; i++){
    yPix = transFuncY(i);
    context.fillText(i, graphLeft - 10, yPix);
    context.beginPath();
    context.moveTo(graphLeft, yPix);
    context.lineTo(graphRight, yPix);
    context.stroke()
  }
}


function drawLine(context, keys, values, xTransFunc, yTransFunc, graphBottom, graphTop, graphLeft){
    context.beginPath();
    // Move the brush to the first point.
    context.moveTo(graphLeft, yTrans(values[0]));
    // Draw a line to every next point.
    for (var i = 1; i < keys.length; i++){
      xPix = xTransFunc(i);
      yPix = yTransFunc(values[i]);
      context.lineTo(xPix, yPix);
    };
    context.lineWidth = 2;
    var gradient = context.createLinearGradient(0, graphBottom, 0, graphTop);
    gradient.addColorStop("0.4", "blue");
    gradient.addColorStop("1.0", "red");
    context.strokeStyle = gradient;
    context.stroke();
}


function drawAxes(context, graphLeft, graphRight, graphBottom, graphTop){
  context.beginPath();
  context.moveTo(graphRight, graphBottom);
  context.lineTo(graphLeft, graphBottom);
  context.lineTo(graphLeft, graphTop);
  context.stroke();
}
