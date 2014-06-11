// data object to keep:
// component size
// component radix
// component arc width
// x, y coordinates of the center of arcs
function data(size, radix, arcWidth, x, y) {
  this.size=size;
  this.radix=radix;
  this.arcWidth=arcWidth;
  this.x=x;
  this.y=y;
}

// compute a data object from canvas size
// zoom means full window size
var getData = function(id, zoom) {
  var can = document.getElementById(id);
  var ctx = can.getContext('2d');  
    
  if (zoom == true) {	  
	  can.width = $(window).width();
	  can.height = $(window).height();	  
  }
  
  var canWidth = can.width;
  var canHeight = can.height;
  var size = canHeight;
  if (8*canWidth/13 <= canHeight) {
    size = 8*canWidth/13;
  }
  
  var radix = 10*size/13;
  var arcWidth = (size/3) >> 0; // take integer value
  var x = canWidth/2;
  var y = 11*size/13; 
  
  return new data(size, radix, arcWidth, x, y);
}

// draw texts: title, description, min, max, value
var drawText = function(id, title, description, unit, min, max, value, showMinMax, d, shadow) {
  var can = document.getElementById(id);
  var ctx = can.getContext('2d');   
  
  // clear canvas
  ctx.clearRect(0, 0, can.width, can.height);
  
  if (shadow) {
	ctx.shadowColor = "#d1ceb2";
	ctx.shadowOffsetX = 5; 
	ctx.shadowOffsetY = 5; 
	ctx.shadowBlur = 5;
  }
    
  ctx.fillStyle = "black";
  ctx.font="bold " + d.size/10  + "px Arial";
  ctx.fillText(title,d.x-ctx.measureText(title).width/2,d.y-d.radix+d.arcWidth/2 + d.size/10);
  
  ctx.fillStyle = "gray";
  if (showMinMax == true) {
    ctx.font=d.size/10 + "px Arial";
    if (unit != "") {
      min = min + unit;
      max = max + unit;
    }
    ctx.fillText(min,d.x-d.radix+d.arcWidth/2-ctx.measureText(min).width/2,d.y + d.size/10 );
    ctx.fillText(max,d.x+d.radix-d.arcWidth/2-ctx.measureText(max).width/2,d.y + d.size/10 );
  }
  if (description != "") {
    ctx.font=d.size/12 + "px Arial";
    ctx.fillText(description,d.x-ctx.measureText(description).width/2,d.y + d.size/12 );
  }
  
  if (unit != "") {
    value = value + unit;
  }  
  ctx.fillStyle = "black";
  ctx.font="bold " + d.size/6 + "px Arial";
  ctx.fillText(value,d.x-ctx.measureText(value).width/2,d.y );   
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0; 
  ctx.shadowOffsetY = 0; 
}

// fill component with color
var drawColor = function(id, angle, color, title, d, shadow) {
  
   var can = document.getElementById(id);
   var ctx = can.getContext('2d');      
      
   // clear all to empty string title
   ctx.beginPath()
   ctx.arc(d.x,d.y-1,d.radix-2,Math.PI , 0, false); // outer (filled)
   ctx.arc(d.x,d.y-1,d.radix+2-d.arcWidth,0, Math.PI, true); // inner (unfills it)   
   ctx.closePath();
   ctx.fillStyle = "white";
   ctx.fill();   
  
   // paint with a linear gradient
   ctx.beginPath()
   //ctx.arc(x,y,radius,startAngle,endAngle, anticlockwise);  
   ctx.arc(d.x,d.y-1,d.radix-1.5,Math.PI , angle-Math.PI, false); // outer (filled)
   ctx.arc(d.x,d.y-1,d.radix-d.arcWidth-0.5,angle-Math.PI, Math.PI, true); // inner (unfills it)
   ctx.closePath();
   var grd = ctx.createLinearGradient(d.x-d.radix, d.y, d.x, d.y);
   grd.addColorStop(0, "white");    
   grd.addColorStop(1, color);  
   ctx.fillStyle = grd;
   ctx.fill();

   // draw title again to be over the fill color
   if (shadow) {
		ctx.shadowColor = "#d1ceb2";
		ctx.shadowOffsetX = 5; 
		ctx.shadowOffsetY = 5; 
		ctx.shadowBlur = 5;
   }
   ctx.fillStyle = "black";  
   ctx.font="bold " + d.size/10 + "px Arial";
   ctx.fillText(title,d.x-ctx.measureText(title).width/2,d.y-d.radix+d.arcWidth/2 + d.size/10);
   ctx.shadowBlur = 0;
   ctx.shadowOffsetX = 0; 
   ctx.shadowOffsetY = 0; 
   
};

// draw the component frame
var drawArc = function(id, d) {
  
  var can = document.getElementById(id);
  var ctx = can.getContext('2d');       
  
  ctx.strokeStyle = "gray";  
  ctx.beginPath();
  ctx.arc(d.x,d.y,d.radix,Math.PI , 0, false); // outer (filled)
  ctx.arc(d.x,d.y,d.radix-d.arcWidth-0.5,0, Math.PI, true); // inner (unfills it)
  ctx.lineTo(d.x-d.radix,d.y);
  ctx.closePath();
  ctx.stroke();  
}

function indicatorP(id, color, title, description, unit, min, max, value, showMinMax, shadow, zoom) {	  	
	
    var d = getData(id, zoom);    
    drawText(id, title, description, unit, min, max, value, showMinMax, d, shadow);
    
    if (value > max) {
        value = max;
    }  
    var range = Math.abs(max - min);
    var delta = Math.abs(min - value);
    var f =  (range - delta) /range;
    var from = 1;
    var to =  180 * (1-f) ;		
 
    if (value > min) {
       // animate using jQuery
       $({ n: from }).animate({ n: to}, {
          duration: 1000,    
          step: function(now, fx) {
             drawColor(id, now*Math.PI/180, color, title, d, shadow);       
          } 
       });  
    }
    // draw component frame at the end
    drawArc(id, d);  
}  

/* With json object
 * 
 *  { "title": "Balance",
 *    "description": "monthly",
 *    "unit" : "$",
 *    "value" : 200,
 *    "min" : 0,
 *    "max" : 1000,
 *    "showMinMax" : true,
 *    "color" : "blue"
 *  }  
 */
function indicator(id, myjson, zoom) {	  	
	
	var title = myjson.title;
	if (typeof title === "undefined") {
	    title = "";
	}	
	
	var description = myjson.description;
	if (typeof description === "undefined") {
		description = "";
	}	
	
	var unit = myjson.unit;
	if (typeof unit === "undefined") {
		unit = "";
	}	
	
	var value = myjson.value;
	if (typeof value === "undefined") {
		value = 0;
	}	
	
	var min = myjson.min;
	if (typeof min === "undefined") {
		min = 0;
	}	
	
	var max = myjson.max;
	if (typeof max === "undefined") {
		max = 100;
	}	
	
	var showMinMax = myjson.showMinMax;
	if (typeof showMinMax === "undefined") {
		showMinMax = true;
	}		
	
	var color = myjson.color;
	if (typeof color === "undefined") {
		color = "blue";
	}	
	
	var shadow = myjson.shadow;
	if (typeof shadow === "undefined") {
		shadow = false;
	}	
	
	indicatorP(id, color, title, description, unit, min, max, value, showMinMax, shadow, zoom); 
	
}

function getIndicatorHeight() {
	return $(window).height();
}


//indicator("canvas", "orange", "Visitors", "per minute", "", 0, 100, 120, true, false);
//indicator("canvas", "blue", "Memory", "", "%", 0, 100, 80, false, false);
//indicator("canvas", "red", "System Indicator", "average", "T", -1, 1, 0.83, true, false);

