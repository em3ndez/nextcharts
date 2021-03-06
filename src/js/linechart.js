/*
 * Json must contain as mandatory only "data" attribute 
 * 
 * type -> line, area
 * style -> normal, soliddot, hollowdot, anchordot, bowdot, stardot
 * labelOrientation -> horizontal, vertical, diagonal, halfdiagonal
 * showLabels -> true means X labels are shown on X axis; we can use false if we want to show them in message tooltip with #x
 * message -> can have markup #val for value, , #x for x label
 *         -> can contain <br> to split text on more lines
 * title.alignment -> center, left, right
 * y2Count -> number of last series represented on dual y2 axis
 * styleGridX, styleGridY -> line, dot, dash
 * onClick -> is a javascript function like 'function doClick(value){ ...}'  *            
 * 
 * { "type": "line", "area"
 *   "style": "normal",
 *   "background" : "white",
 * 	 "data": [[ 16, 66, 24, 30, 80, 52 ], [ 48, 50, 29, 60, 70, 58 ], [ 30, 40, 28, 52, 74, 50 ]], 
 *   "labels": ["JAN","FEB","MAR","APR","MAY", "JUN"],
 *   "labelOrientation": "horizontal",  
 *   "color": ["#004CB3","#A04CB3", "#7aa37a"], 
 *   "legend": ["2011 First year of work" , "2012 Second year of work", "2013 Third year of work"],
 *   "alpha" : 0.8, 
 *   "colorXaxis": "blue",
 *   "colorYaxis": "blue",
 *   "showGridX": true, 
 *   "showGridY": true, 
 *   "showLabels": true,
 *   "colorGridX": "rgb(248, 248, 216)", 
 *   "colorGridY": "rgb(248, 248, 216)", 
 *   "styleGridX": "line",
 *   "styleGridY": "line",
 *   "message" : "Value \: #val", 
 *   "showTicks" : true,
 *   "tickCount" : 5, 
 *   "startingFromZero" : false,
 *   "title" : {
 *   	"text": "Analiza financiara", 
 *   	"font": {
 *   		"weight": "bold", 
 *   		"size": "16", 
 *   		"family": "sans-serif"
 *   	}, 
 *   	"color": "#000000",
 *      "alignment":"left"
 *   }, 
 *   "xData" : {
 *   	"font": {
 *   		"weight": "bold", 
 *   		"size": "16", 
 *   		"family": "sans-serif"
 *   	}, 
 *   	"color": "blue"
 *   },
 *   "yData" : {
 *   	"font": {
 *   		"weight": "bold", 
 *   		"size": "16", 
 *   		"family": "sans-serif"
 *   	}, 
 *   	"color": "blue"
 *   },
 *   "xLegend" : {
 *      "text": "Month", 
 *   	"font": {
 *   		"weight": "bold", 
 *   		"size": "16", 
 *   		"family": "sans-serif"
 *   	}, 
 *   	"color": "blue"
 *   },
 *   "yLegend" : {
 *      "text": "Sales",
 *   	"font": {
 *   		"weight": "bold", 
 *   		"size": "16", 
 *   		"family": "sans-serif"
 *   	}, 
 *   	"color": "blue"
 *   },
 *   "tooltipPattern" : {
 *   	"decimals": 2,
 *   	"decimalSeparator" : ".",
 *      "thousandSeparator" : ","
 *   },
 *   "dualYaxis": true, 
 *   "colorY2axis": "blue",
 *   "y2Legend" : {
 *      "text": "Sales",
 *   	"font": {
 *   		"weight": "bold", 
 *   		"size": "16", 
 *   		"family": "sans-serif"
 *   	}, 
 *   	"color": "blue"
 *   },
 *   "y2Count" : 1,
 *   "onClick" : "function doClick(value){console.log("Call from function: " + value);}"
 * }
 * 
 */

var lineChart = function(myjson, idCan, idTipCan, canWidth, canHeight) {

var obj;
var data;
var labels; 
var labelOrientation;
var globalAlpha;
var showGridX;
var showGridY;
var showLabels;
var background;
var message;
var tickCount;
var showTicks;
var startingFromZero;
var chartType;
var chartStyle;
var seriesColor;
var xData, yData;
var series;
var yStep;
var maxK = new Array(); 
var minK = new Array();
var dotsK = new Array();
var max;
var min;
//space between 2 ticks
var tickStep;
var minValY;
var maxValY;
// for dual Y axis
var y2Step;
var maxK2 = new Array(); 
var minK2 = new Array();
var max2;
var min2;
var minValY2;
var maxValY2;
var hStep2 = 0;
var y2LegendSpace = 0;
var y2Count = 1;
// bottom vertical space (to fit X labels and X legend)
var step = 0;
var gap = 40;
// left horizontal space (to fit bigger Y labels and Y legend)
var hStep = 60;
var titleSpace = 0;
var legendSpace = 0;
var xLegendSpace = 0;
var yLegendSpace = 0;
var xaxisY = 0;
var realWidth;
var realHeight;
var canvas;  
var c; 
var tipCanvas;
var tempCanvas;
var tempCtx;
var H = 6;
var dotRadius = 4;
// space between X axis and first tick
var tickInit;
var resizeWidth = false;
var resizeHeight = false;
//by default chart title, legends and axis values strings have a defined font size
//if we want to have font size scaled accordingly with chart width then this property must be true 
//(such example may be when we want to show the chart on a big monitor)
var adjustableTextFontSize = false;
var highlighterSerie = -1;
var highlighterSerieIndex = -1;

function drawLine(myjson, idCan, idTipCan, canWidth, canHeight) {	
			
	canvas = document.getElementById(idCan);  
	if (canvas == null) {
		return;
	}
	tipCanvas = document.getElementById(idTipCan);
	c = canvas.getContext('2d');
	
	tempCanvas = document.createElement('canvas');	
	tempCtx = tempCanvas.getContext('2d');	
	
	obj = myjson;
	chartType = obj.type;
	if (typeof chartType === "undefined") {
	    chartType = "line";
	}		
					
	background = obj.background;
	if (typeof background === "undefined") {	
		background = "white";
	}
	
	
	chartStyle = obj.style;
	// test for passing a wrong style
	if ((typeof chartStyle === "undefined") || (find(['normal', 'soliddot', 'hollowdot', 'anchordot', 'bowdot', 'stardot'],chartStyle) === false)) {	
		chartStyle = "normal";
	}	
	
	data = obj.data[0];
	series = obj.data.length;
	
	labels = obj.labels; 
	if (typeof labels === "undefined") {
		labels = [];
		for (var i=0; i<data.length; i++) {
			labels.push("");
		}
	}
	
	labelOrientation = obj.labelOrientation;
	if (typeof labelOrientation === "undefined") {
    	labelOrientation = "horizontal";
    }
	
	globalAlpha = obj.alpha;
	if (typeof globalAlpha === "undefined") {
        globalAlpha = 0.8;
    }
	
	showTicks = obj.showTicks;
	if (typeof showTicks === "undefined") {
		showTicks = true;
	}	
	
	startingFromZero = obj.startingFromZero;
	if (typeof startingFromZero === "undefined") {
		startingFromZero = false;
	}	
	
	showGridX = obj.showGridX;
	if (typeof showGridX === "undefined") {
        showGridX = true;
    }
        
	showGridY = obj.showGridY;
	if (typeof showGridY === "undefined") {
        showGridY = true;
    }
	
	showLabels = obj.showLabels;
	if (typeof showLabels === "undefined") {
        showLabels = true;
    }
	
	message = obj.message;
	if (typeof message === "undefined") {		
		message = "#val";		
	}
	
	adjustableTextFontSize = obj.adjustableTextFontSize;
	if (typeof adjustableTextFontSize === "undefined") {
		adjustableTextFontSize = false;
	}	
	
	tickCount = obj.tickCount;
	if (typeof tickCount === "undefined") {
        tickCount = 5;        
    }    
			
	seriesColor = obj.color;
	if (typeof seriesColor === "undefined") {
		seriesColor = distinctHexColors(series);
    }    
	
	y2Count = obj.y2Count;
	if (typeof y2Count === "undefined") {	
		y2Count = 1;
	}
	// must have at least one series on first Y axis
	if (y2Count >= series) {
		y2Count = series-1;
	}
	
	// compute min ,max values
	var countNo = series;
	if ((countNo > 1) && obj.dualYaxis) {
		countNo = series-y2Count;
	}
	for (var k=0; k<countNo; k++) {
		maxK[k] = Math.max.apply( Math, obj.data[k] );
		minK[k] = Math.min.apply( Math, obj.data[k] ); 
	}    	
    max = Math.max.apply( Math, maxK);	         
    min = Math.min.apply( Math, minK);
    if (startingFromZero && (min > 0)) {
    	min = 0;
    } 
    
    var objStep = calculateYStep(min, max, tickCount);
    yStep = objStep.yStep;
    minValY = objStep.minValY;
    maxValY = objStep.maxValY;    
    
    // compute hStep (for vertical labels and yLegend to fit) 
	hStep = computeHStep(maxValY, yStep, true);		
	
	// for y dual axis
	if (obj.dualYaxis && (countNo > 0)) {		
		
		if (countNo == series) {
			countNo = series-1;
		}
		
		for (var k=countNo; k<series; k++) {
			maxK2[k-countNo] = Math.max.apply( Math, obj.data[k] );
			minK2[k-countNo] = Math.min.apply( Math, obj.data[k] ); 
		}    	
	    max2 = Math.max.apply( Math, maxK2);	         
	    min2 = Math.min.apply( Math, minK2);
	    if (startingFromZero && (min2 > 0)) {
	    	min2 = 0;
	    } 
		
		var objStep2 = calculateYStep(min2, max2, tickCount);
	    y2Step = objStep2.yStep;
	    minValY2 = objStep2.minValY;
	    maxValY2 = objStep2.maxValY; 
	    
	    hStep2 = computeHStep(maxValY2, y2Step, false);		    
	}
        		
	updateSize(canWidth, canHeight);
    
    canvas.addEventListener('mousemove', 
			function(evt) { 
				var hme = Object.create(handleMouseEvent);
				hme.mousePos = getMousePos(canvas, evt);
				hme.tooltip = getTooltip(hme.mousePos);		
				hme.execute(canvas, tipCanvas, evt); 
			}, 
			false);  
    
    canvas.addEventListener ("mouseout", 
    		function(evt) {
    			tipCanvas.style.left = "-2000px";
    		}, 
    		false);
    
    canvas.addEventListener("click", onClick, false);
        
    if (resizeWidth || resizeHeight) {    	
    	window.addEventListener('resize', resizeCanvas, false);
    }

	drawChart();
}

function updateSize(canWidth, canHeight) {		
	if (canWidth !== undefined) {
		if (isPercent(canWidth)) {
			var percent = canWidth.substring(0, canWidth.length-1);			
			//canvas.width = window.innerWidth*percent/100;
			var cl = canvas.parentNode;			
			canvas.width = cl.offsetWidth*percent/100;				
			resizeWidth = true;
		} else {
			canvas.width = canWidth;
		}
	}	 
	if (canHeight !== undefined) {
		if (isPercent(canHeight)) {
			var percent = canHeight.substring(0, canHeight.length-1);
			canvas.height = window.innerHeight*percent/100;
			//var cl = canvas.parentNode;	
			//canvas.height = cl.offsetHeight*percent/100;
			resizeHeight = true;
		} else {
			canvas.height = canHeight;
		}
	}		
		
	tempCanvas.width = canvas.width;
	tempCanvas.height = canvas.height;
		
	realWidth = canvas.width;
	realHeight = canvas.height;	
		
	// adjust the  x gap between elements (should be smaller for smaller widths)
	gap = realWidth/10 - 10;
				
	
	tickInit = realHeight/12;	
    
	// space between 2 ticks
	tickStep = (realHeight-step-tickInit)/tickCount;	  
	
	if (adjustableTextFontSize) {						
	    var objStep = calculateYStep(min, max, tickCount);
	    yStep = objStep.yStep;
	    minValY = objStep.minValY;
	    maxValY = objStep.maxValY;
	    
	    // compute hStep (for vertical labels and yLegend to fit) 
	    hStep = computeHStep(maxValY, yStep, true);
	    
	    if (obj.dualYaxis) {
	    	var objStep2 = calculateYStep(min2, max2, tickCount);
		    y2Step = objStep2.yStep;
		    minValY2 = objStep2.minValY;
		    maxValY2 = objStep2.maxValY; 
		    
		    hStep2 = computeHStep(maxValY2, y2Step, false);		    
	    }		   
	}
}


function animDraw() {      
    if (drawIt(H)) {   
    	tempCtx.drawImage(canvas, 0, 0);
        return false;
    }    
    H += 1+(realHeight-step-titleSpace-legendSpace)/30;    
    window.requestAnimFrame(animDraw);      
}    


// function called repetitive by animation
function drawIt(H) {    		
	
	// to redraw the entire canvas (it extends under drawn x axis)
	drawInit();
			
	// if we clear only the rectangle containing the chart (without title , legends, labels)
	// clear the drawn area (if drawInit is called in drawChart)
	//	c.fillStyle = background; 
	//	c.fillRect(hStep-10,titleSpace+legendSpace,width, realHeight-step-titleSpace-legendSpace-2);
	
	var stop = drawData(true, false, "");
	
	drawGrid();
	drawAxis();
	 				
	return stop;
}

// withFill = false means to construct just the path needed for tooltip purposes
function drawData(withFill, withClick, mousePos) {
	var font = c.font;
	    
	//draw data 
	c.lineWidth = 1.0;
	var stop = true;	
		
	var cursorStyle = 'default';
	for(var k=0; k<series; k++) {  
	  dotsK[k] = [];	
	  for(var i=0; i<data.length; i++) { 		  
	    var dp = obj.data[k][i];	
	    var width =  (realWidth - hStep - hStep2 - gap*(1+Math.sqrt(series)))/data.length;
	    var dotX = hStep + i*(realWidth-hStep-hStep2)/data.length + width/2;       
	    var Yheight = realHeight-step-(dp-minValY)*tickStep/yStep;  
	    if (obj.dualYaxis && (y2Count > 0) && (k >= series-y2Count)) {
	    	Yheight = realHeight-step-(dp-minValY2)*tickStep/y2Step;  
	    }
	    var dotY = realHeight-step-H;
	    var dotX2 = dotX;
	    var dotY2 = dotY;
	    var Yheight2 = Yheight;
	    if (i < data.length-1) {
	    	dotX2 = hStep + (i+1)*(realWidth-hStep-hStep2)/data.length + width/2;
	    	dotY2 = realHeight-step-H;
	    	Yheight2 = realHeight-step-(obj.data[k][i+1]-minValY)*tickStep/yStep;
	    	if (obj.dualYaxis && (y2Count > 0) && (k >= series-y2Count)) {
	    		Yheight2 = realHeight-step-(obj.data[k][i+1]-minValY2)*tickStep/y2Step;
	    	}
	    }
	    	    	    
	    if (dotY <= Yheight) {
	        dotY = Yheight;
	    } else {
	        stop = false;
	    }  
	    if (dotY+2 > xaxisY) {
	        dotY = xaxisY-1;	        
	    } 	
	    if (i < data.length-1) {
		    if (dotY2 <= Yheight2) {
		        dotY2 = Yheight2;
		    } else {
		        stop = false;
		    }  
		    if (dotY2+2 > xaxisY) {
		        dotY2 = xaxisY-1;	        
		    } 	    
	    }
	    	   	    
	    dotsK[k].push({x:dotX, y:dotY});
	    	 
	    var savedStroke = c.strokeStyle;
	    if (chartStyle == "normal") {
			dotRadius = 3;
		}
	    drawLineElements(c, chartStyle, chartType, dotRadius, seriesColor, dotsK, data.length, xaxisY, globalAlpha, k, i, dotX, dotY, dotX2, dotY2, withFill);
	    c.strokeStyle = savedStroke;
	      	    
	    var found;
	    if (!withFill) {
	    	
	    	// highlight selection
			if ((k == highlighterSerie) && (i == highlighterSerieIndex)) {
				highlight(k, 0.5);		
			} else {
				unhighlight(k, i);
			}	
	    	
	    	if (c.isPointInPath(mousePos.x, mousePos.y)) {  
	    		highlighterSerie = k;	    		
	    		highlighterSerieIndex = i;	  
	    		var tValue = obj.data[k][i];
	    		if (obj.tooltipPattern !== undefined) {
	    			tValue = formatNumber(tValue, obj.tooltipPattern.decimals, obj.tooltipPattern.decimalSeparator, obj.tooltipPattern.thousandSeparator);
	    		}	  
	    		var returnValue = labels[i]; // tValue
	    		if (withClick) {
	    			if (found === undefined) {
		        		found = returnValue;
		        	}
	    		} else {
			    	var mes = String(message).replace('#val', tValue);	
			    	mes = mes.replace('#x', returnValue);
			    	if (obj.onClick !== undefined) {
			    		cursorStyle = 'pointer';
			    		canvas.style.cursor = cursorStyle;
			    	}
			    	if (found === undefined) {
		        		found = mes;
		        	}
	    		}
		    } else {
		    	if (cursorStyle != 'pointer') {
		    		canvas.style.cursor = 'default';
		    	}
		    }    					   
	    }
	  } 
	}   
	
	if (found !== undefined) {		  
		return found;
	}	
		
	if (withFill) {
		return stop;
	} else {
		// empty tooltip message
		return "";
	}
}

function highlight(k, luminance) {
	c.fillStyle = background;			
	c.fill(); 
	
	var lColor = highlightColor(seriesColor[k],luminance);
	c.fillStyle = lColor;
	c.globalAlpha = globalAlpha;
	c.fill();  
	c.globalAlpha = 1;	
	
	highlighterSerie = -1;
	highlighterSerieIndex = -1;		
}

function unhighlight(k, i) {
	if ((i == 0) && (k == 0)) {
		c.drawImage(tempCanvas, 0, 0);	
	}
}

function drawInit() {
	
	var font = c.font;
	
	//draw background (clear canvas)
	c.fillStyle = background; 	
	c.fillRect(0,0,realWidth,realHeight);			
	
	// adjust step with X label space (x label can have different orientations) and X legend space
	var xLabelWidth = computeVStep();

	//draw title		
	if (typeof obj.title !== "undefined") {
		var titleColor = obj.title.color;
		if (titleColor === undefined) {
			titleColor = '#000000';
		}
		c.fillStyle = titleColor;
		var b = " ";
		var f = obj.title.font;
		if (f === undefined) {
			f.weight = "bold";
			f.size = 12;
			f.family = "sans-serif";
		}
		if (adjustableTextFontSize) {
			f.size=getAdjustableTitleFontSize();
		}
		c.font = f.weight + b + f.size + "px" + b + f.family;   		
		var titlePadding = 20;
		if (adjustableTextFontSize) {
			titlePadding = getAdjustableTitleFontSize()/2;
		}
		titleSpace = +titlePadding + +f.size;		
		 
		var alignment = obj.title.alignment;
		if (alignment === undefined) {
			alignment = "center";
		}
		var xTitle;
		if (alignment == "left") {
			xTitle = hStep;
		} else if (alignment == "right") {
			xTitle = canvas.width - c.measureText(obj.title.text).width - 10;
		} else {
			// center
			xTitle = canvas.width/2- c.measureText(obj.title.text).width/2;
		}				
		
		var titlePadding = 20;
		if (adjustableTextFontSize) {
			titlePadding = getAdjustableTitleFontSize()/2;
		}
		c.fillText(obj.title.text, xTitle , titlePadding+titleSpace/2 );    
		c.font = font;   				
	} else {
		titleSpace = 10;
	}    
	
	
	//draw X legend	
	if (typeof obj.xLegend !== "undefined") {
						
		var xLegendColor = obj.xLegend.color;
		if (xLegendColor === undefined) {
			xLegendColor = '#000000';
		}
		c.fillStyle = xLegendColor;
		var b = " ";
		var f = obj.xLegend.font;
		if (f === undefined) {
			f.weight = "bold";
			f.size = 12;
			f.family = "sans-serif";
		}
		if (adjustableTextFontSize) {
			f.size = getAdjustableLabelFontSize();
		}
		c.font = f.weight + b + f.size + "px" + b + f.family;     
		var legendPadding = 20;
		if (adjustableTextFontSize) {
			legendPadding = getAdjustableLabelFontSize()/2;
		}
		xLegendSpace = +legendPadding + +f.size;             					
		
		c.fillText(obj.xLegend.text, realWidth/2- c.measureText(obj.xLegend.text).width/2 , realHeight - f.size );    
		c.font = font;   	
	} else {
		xLegendSpace = 0;
	}    
	
	//draw Y legend	
	if (typeof obj.yLegend !== "undefined") {
		var yLegendColor = obj.yLegend.color;
		if (yLegendColor === undefined) {
			yLegendColor = '#000000';
		}
		var b = " ";
		var f = obj.yLegend.font;
		if (f === undefined) {
			f.weight = "bold";
			f.size = 12;
			f.family = "sans-serif";
		}
		if (adjustableTextFontSize) {
			f.size = getAdjustableLabelFontSize();
		}
		c.font = f.weight + b + f.size + "px" + b + f.family;      
		c.fillStyle = yLegendColor;		
		c.save();	    	
    	c.translate(10  , realHeight/2);
    	c.rotate(-Math.PI/2);
    	c.textAlign = "center";	    	     	
    	c.fillText(obj.yLegend.text,0, f.size);
    	c.restore();		    
		c.font = font;            
	} else {
		yLegendSpace = 0;
	}
	
	// draw Y2 legend
	if (obj.dualYaxis && (typeof obj.y2Legend !== "undefined")) {
		var y2LegendColor = obj.y2Legend.color;
		if (y2LegendColor === undefined) {
			y2LegendColor = '#000000';
		}
		var b = " ";
		var f = obj.y2Legend.font;
		if (f === undefined) {
			f.weight = "bold";
			f.size = 12;
			f.family = "sans-serif";
		}
		if (adjustableTextFontSize) {
			f.size = getAdjustableLabelFontSize();
		}
		c.font = f.weight + b + f.size + "px" + b + f.family;      
		c.fillStyle = y2LegendColor;		
		c.save();	    	
    	c.translate(realWidth - f.size - 10  , realHeight/2);
    	c.rotate(-Math.PI/2);
    	c.textAlign = "center";	    	     	
    	c.fillText(obj.y2Legend.text,0, f.size);
    	c.restore();		    
		c.font = font;            
	} else {
		y2LegendSpace = 0;
	}    


	// draw legend	
	if (typeof obj.legend !== "undefined") {         
		var x = hStep;		
		c.font = "bold 10px sans-serif";
		if (adjustableTextFontSize) {
			c.font = "bold " + getAdjustableLabelFontSize() + "px sans-serif";
		}		 
		var legendPadding = 20;		
		if (adjustableTextFontSize) {
			legendPadding = getAdjustableLabelFontSize();
		}	
		legendSpace = legendPadding;
		var legendY = titleSpace+legendPadding;								
		c.globalAlpha = globalAlpha;
		for (var k=0; k<series; k++) {        
			c.fillStyle = seriesColor[k];        
			var legendWidth = c.measureText("---- " + obj.legend[k]).width + 24;             
						
			if (x + legendWidth > realWidth) {
				// draw legend on next line if does not fit on current one
				x = hStep;
				var lineSpace = 14;
				if (adjustableTextFontSize) {
					lineSpace = getAdjustableLabelFontSize();
				}
				legendY = legendY + lineSpace;
				var legendPadding = 20;		
				if (adjustableTextFontSize) {
					legendPadding = getAdjustableLabelFontSize();
				}
				legendSpace += legendPadding;						
			}    
					
			c.fillText("---- " + obj.legend[k], x, legendY);
			     
			x = x + legendWidth;			
		}  
		c.globalAlpha = 1;
		c.font = font;
	}    	
	
	
	
	c.font = font;

    
	// adjust tickStep depending if title or legend are present or not
	tickStep = (realHeight-step-titleSpace-legendSpace-tickInit)/tickCount; 	

	// compute Y value for xAxis
	xaxisY = tickCount*tickStep+tickInit+titleSpace+legendSpace; 
	
	drawLabels(xLabelWidth);
}


function drawLabels(xLabelWidth) {
	
	var font = c.font;
			
	//draw Y labels and small lines 	
	if (showTicks) {
		c.fillStyle = "black"; 
		if (obj.yData !== undefined) {
			c.fillStyle = obj.yData.color; 
			var b = " ";
			var yfont = obj.yData.font;
			if (adjustableTextFontSize) {
				yfont.size=getAdjustableLabelFontSize();
			}
			c.font = yfont.weight + b + yfont.size + "px" + b + yfont.family;  
		}
		for(var i=0; i<tickCount+1; i++) {        		
			var label;
			var label2;
			if (obj.tooltipPattern !== undefined) {
				// y labels can have more than two decimals
				var decimals = obj.tooltipPattern.decimals;
				var exp = Math.pow(10, decimals);
				label = Math.round((maxValY-i*yStep)*exp)/exp;
				if (obj.dualYaxis) { 
					label2 = Math.round((maxValY2-i*y2Step)*exp)/exp;
				}
			} else {
				label = Math.round((maxValY-i*yStep)*100)/100;
				if (obj.dualYaxis) { 
					label2 = Math.round((maxValY2-i*y2Step)*100)/100;
				}
			}
			var labelWidth = c.measureText(label).width;   						
			
			c.fillText(label + "",hStep - 15 - labelWidth , i*tickStep+tickInit+titleSpace+legendSpace);
			
			c.lineWidth = 2.0; 
			c.beginPath();     
		    c.moveTo(hStep-15,i*tickStep+tickInit+titleSpace+legendSpace);     
		    c.lineTo(hStep-10,i*tickStep+tickInit+titleSpace+legendSpace);   
		    c.closePath();    
		    c.stroke();    
		    
		    if (obj.dualYaxis) { 
		    	var labelWidth2 = c.measureText(label2).width;   						
				
				c.fillText(label2 + "",realWidth-hStep2+5 , i*tickStep+tickInit+titleSpace+legendSpace);
				
				c.lineWidth = 2.0; 
				c.beginPath();     
			    c.moveTo(realWidth-hStep2,i*tickStep+tickInit+titleSpace+legendSpace);     
			    c.lineTo(realWidth-hStep2+5,i*tickStep+tickInit+titleSpace+legendSpace);   
			    c.closePath();    
			    c.stroke();    
		    }
		    
		} 
		c.font = font;
	}

	//draw X labels 
	if (showLabels) {
		c.fillStyle = "black"; 
		if (obj.xData !== undefined) {
			c.fillStyle = obj.xData.color; 
			var b = " ";
			var xfont = obj.xData.font;
			if (adjustableTextFontSize) {
				xfont.size=getAdjustableLabelFontSize();
			}
			c.font = xfont.weight + b + xfont.size + "px" + b + xfont.family;  
		}		
		for(var i=0; i<labels.length; i++) {   
		    var middleX = hStep + i*(realWidth-hStep-hStep2 )/data.length + (realWidth - hStep - hStep2 - gap*(1+Math.sqrt(series)))/data.length/2;
		    		
			var xLabelSpace = computeXLabelSpace(labels[i]);
			if (labelOrientation == "vertical") {
			   	c.save();	    	
			   	c.translate(middleX  - c.measureText(labels[i]).width / 2, realHeight-step/2-xLegendSpace/2);
			   	c.rotate(-Math.PI/2);
			   	c.textAlign = "center";	    	 
			   	c.fillText(labels[i],0, c.measureText(labels[i]).width / 2 + 6 );
			   	c.restore();
			} else if (labelOrientation == "diagonal") {
			  	c.save();	    	
			  	c.translate(middleX  - (c.measureText(labels[i]).width / 2)* Math.cos(Math.PI/4), realHeight-step + (c.measureText(labels[i]).width / 2)* Math.sin(Math.PI/4));
			   	c.rotate(-Math.PI/4);
			   	c.textAlign = "center";	    	 
			   	c.fillText(labels[i],0, 16);
			   	c.restore();	
			} else if (labelOrientation == "halfdiagonal") {
			    c.save();	    	
			    c.translate(middleX  - (c.measureText(labels[i]).width / 2)* Math.cos(Math.PI/8), realHeight-step + (c.measureText(labels[i]).width / 2)* Math.sin(Math.PI/8));
			    c.rotate(-Math.PI/8);
			    c.textAlign = "center";	    	 
			    c.fillText(labels[i],0, 16);
			    c.restore();		
			} else {
			   	// horizontal
			   	c.fillText(labels[i],middleX  - c.measureText(labels[i]).width / 2, realHeight-step/2-xLegendSpace/4);
			}
			
		}  
		c.font = font;
	}
	
}

function drawGrid() {		
			
	// draw  horizontal grid  (for Y labels)
	if (showGridY) {
		if (obj.styleGridY !== "undefined") {
			if (c.setLineDash) {
				if (obj.styleGridY == "dot") {
					c.setLineDash([1, 3]);
				} else if (obj.styleGridY == "dash") {
					c.setLineDash([5, 8]);
				} 	
			}
		}		
		for(var i=0; i<tickCount+1; i++) {        			    	    	    
	    	var xColor = c.strokeStyle;
	    	if (obj.colorGridY !== "undefined") {
	    		c.strokeStyle = obj.colorGridY;
	    	}
	    	c.lineWidth = 0.2;        
	        c.beginPath(); 
	        c.moveTo(hStep-10,i*tickStep+tickInit+titleSpace+legendSpace);  
	        var diff = 10;
	        if (obj.dualYaxis) {
	        	diff = hStep2;
	        }
	        c.lineTo(realWidth-diff,i*tickStep+tickInit+titleSpace+legendSpace);  
	        c.closePath();    
	        c.stroke();
	        c.lineWidth = 2.0;   
	        c.strokeStyle = xColor;
	    }    
		if (c.setLineDash) {
			c.setLineDash([]);
		}
	} 	
	
	// draw  vertical grid  (for X labels)
    if (showGridX) {
    	if (obj.styleGridX !== "undefined") {
    		if (c.setLineDash) {
				if (obj.styleGridX == "dot") {
					c.setLineDash([1, 3]);
				} else if (obj.styleGridX == "dash") {
					c.setLineDash([5, 8]);
				} 	
    		}
		}	
    	for(var i=0; i<labels.length; i++) {   
    		var middleX = hStep + i*(realWidth-hStep-hStep2 )/data.length + (realWidth - hStep - hStep2 - gap*(1+Math.sqrt(series)))/data.length/2;	    	    
	    	var yColor = c.strokeStyle;
	    	if (obj.colorGridX !== "undefined") {
	    		c.strokeStyle = obj.colorGridX;
	    	}
	        c.lineWidth = 0.2;        
	        c.beginPath(); 
	        c.moveTo(middleX,10+titleSpace+legendSpace);  
	        c.lineTo(middleX,realHeight-step);  
	        c.closePath();    
	        c.stroke();
	        c.lineWidth = 2.0;   
	        c.strokeStyle = yColor;
	    }  
    	if (c.setLineDash) {
    		c.setLineDash([]);
    	}
	}  	
	
}

function drawAxis() {
	c.fillStyle = "black"; 
	c.lineWidth = 2.0; 
	var axisColor = c.strokeStyle;	
	
	// y axis
	if (obj.colorYaxis !== "undefined") {
		c.strokeStyle = obj.colorYaxis;
	}
	c.beginPath();     
	c.moveTo(hStep-10,titleSpace+legendSpace); 
	c.lineTo(hStep-10,realHeight-step); 
	c.closePath();
	c.stroke();
	
	// x axis
	if (obj.colorXaxis !== "undefined") {
		c.strokeStyle = obj.colorXaxis;
	}	
	c.beginPath(); 
	c.moveTo(hStep-10,realHeight-step); 	
	var diff = 5;
	if (obj.dualYaxis) {
		diff = hStep2 - 5;
	}
	c.lineTo(realWidth-diff,realHeight-step);	
	c.closePath();
	c.stroke();
	
	// second y axis
	if (obj.dualYaxis) {
		if (obj.colorY2axis !== "undefined") {
			c.strokeStyle = obj.colorY2axis;
		}
		c.beginPath(); 
		c.moveTo(realWidth-hStep2,titleSpace+legendSpace); 	
		c.lineTo(realWidth-hStep2,realHeight-step);	
		c.closePath();
		c.stroke();
	}
	
	c.strokeStyle = axisColor;
}


function getTooltip(mousePos) {	
	return drawData(false, false, mousePos);	 	  	 
}      

function onClick(evt) {
	var v = drawData(false, true, getMousePos(canvas, evt));	
	if ((v !== "") && (obj.onClick !== undefined)) {		
		var f = obj.onClick;			
		eval(f);
		doClick(v);
	}	
	return v;
}

function drawChart() {	
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000/60);
              };
    })();                
            
    window.requestAnimFrame(animDraw); 
}  

//compute hStep (for vertical labels and yLegend to fit) 
function computeHStep(maxValY, yStep, takeCare) {	
	var result;
	var font = c.font;
	if (showTicks) {
		var maxLabelWidth = 0;	
		if (typeof obj.yData !== "undefined") {	 		
			var yfont = obj.yData.font;	
			if (adjustableTextFontSize) {
				yfont.size=getAdjustableLabelFontSize();
			}
			var b = " ";
			c.font = yfont.weight + b + yfont.size + "px" + b + yfont.family;  		
		}
		for(var i=0; i<tickCount+1; i++) {        
			var label = Math.round((maxValY-i*yStep)*100)/100;
			var labelWidth = c.measureText(label).width;
			if (labelWidth > maxLabelWidth) {
				maxLabelWidth = labelWidth;
			}   
		}      	
		result = maxLabelWidth + 20;
	} else {
		result = 20;
	}
	c.font = font;
		
	if (obj.dualYaxis && !takeCare) {
		if (typeof obj.y2Legend !== "undefined") {		
			var b = " ";
			var f = obj.y2Legend.font;
			if (f === undefined) {
				f.weight = "bold";
				f.size = 12;
				f.family = "sans-serif";
			}
			if (adjustableTextFontSize) {
				f.size = getAdjustableLabelFontSize();
			}	
			c.font = f.weight + b + f.size + "px" + b + f.family;      
			y2LegendSpace = f.size;		    
			c.font = font;            
			result += y2LegendSpace;
		}
	}
	
	// take care for halfdiagonal, diagonal long labels
	// if they are too long hStep must be increased accordingly
	// for dual Y axis we do not need this
	if (takeCare) {				
		if (typeof obj.yLegend !== "undefined") {		
			var b = " ";
			var f = obj.yLegend.font;
			if (f === undefined) {
				f.weight = "bold";
				f.size = 12;
				f.family = "sans-serif";
			}
			if (adjustableTextFontSize) {
				f.size = getAdjustableLabelFontSize();
			}	
			c.font = f.weight + b + f.size + "px" + b + f.family;      
			var legendPadding = 20;		
			if (adjustableTextFontSize) {
				legendPadding = getAdjustableLabelFontSize();
			}
			yLegendSpace = +legendPadding + +f.size;							    
			c.font = font;            
			result += yLegendSpace;
		}
		
		var cf = c.font;
		if (obj.xData !== undefined) {		
			var b = " ";
			var xfont = obj.xData.font;
			if (adjustableTextFontSize) {
				xfont.size=getAdjustableLabelFontSize();
			}
			c.font = xfont.weight + b + xfont.size + "px" + b + xfont.family;  
		}		
		var minPos = new Array();
		for(var i=0; i<labels.length; i++) {		
			realWidth = canvas.width;		
			var middleX = result + i*(realWidth-result )/data.length + (realWidth - result - gap*(1+Math.sqrt(series)))/data.length/2;
			var angle;
			if (labelOrientation == "diagonal") {
				angle = Math.PI/4;	    			
		     } else if (labelOrientation == "halfdiagonal") {		    	
			    angle = Math.PI/8;		
		    } 
			if (angle !== undefined) {
				var len = middleX - c.measureText(labels[i]).width * Math.cos(angle);
				minPos.push(len);				    	
			}		
		}		
		var len = Math.min.apply( Math, minPos );
		if (minPos.length > 0) {			
	    	if (len < 10) {
	    		result += (10 - len);
	    	}	 
		}
	}
	
	return result;
}

// computes vertical step needed 
// returns maximum width for x labels
function computeVStep() {
	var xLabelWidth = 0;
	if (typeof obj.xData !== "undefined") {	 		
		var xfont = obj.xData.font;	
		if (adjustableTextFontSize) {
			xfont.size=getAdjustableLabelFontSize();
		}
		var b = " ";
		c.font = xfont.weight + b + xfont.size + "px" + b + xfont.family;  		
	}
	if (showLabels) {
		for(var i=0; i<labels.length; i++) {            
		    var labelWidth = computeXLabelSpace(labels[i]);
		    if (labelWidth > xLabelWidth) {
		        xLabelWidth = labelWidth;
		    }   
		} 
	}
	var _xLegendSpace = 0;
	if (typeof obj.xLegend !== "undefined") {				
		var f = obj.xLegend.font;
		if (f === undefined) {
			f.weight = "bold";
			f.size = 12;
			f.family = "sans-serif";
		}		      
		if (adjustableTextFontSize) { 
			f.size = getAdjustableLabelFontSize();
		}
        var legendPadding = 20;		
		if (adjustableTextFontSize) {
			legendPadding = getAdjustableLabelFontSize();
		}
		_xLegendSpace = +legendPadding + +f.size;  
	}		
	if ((step < xLabelWidth+_xLegendSpace) || adjustableTextFontSize) {    
	    step = xLabelWidth+_xLegendSpace;	    		
	}	
	return xLabelWidth;
}

// depends on label orientation
function computeXLabelSpace(label) {
	var _labelWidth = c.measureText(label).width + 10; // vertical
   
	if (labelOrientation === "horizontal") {
	   	if (typeof obj.xData !== "undefined") {	 	
	   		_labelWidth =  obj.xData.font.size + 20;
	   		if (adjustableTextFontSize) {
	    		_labelWidth=getAdjustableLabelFontSize() + 20;
	    	}
	   	} else {
	   		_labelWidth = 12 + 20;
	   	}	
	} else if (labelOrientation === "halfdiagonal") {
	   	_labelWidth = c.measureText(label).width * Math.sin(Math.PI/8) + 20;
	} else if (labelOrientation === "diagonal") {
	   	_labelWidth = c.measureText(label).width * Math.sin(Math.PI/4) + 20;
	}
	
    return _labelWidth;
}

function getTitleSpace() {
	var space = 10;
	if (typeof obj.title !== "undefined") {		
		var f = obj.title.font;
		if (f === undefined) {			
			f.size = 12;			
		}		      
		if (adjustableTextFontSize) {
			f.size=getAdjustableTitleFontSize();
		}
        var titlePadding = 20;
        if (adjustableTextFontSize) {
        	titlePadding = getAdjustableTitleFontSize();
        }
		space = +titlePadding + +f.size;
	} 
	return space;
}

function getXLegendSpace() {	
    var _xLegendSpace = 0;
	if (typeof obj.xLegend !== "undefined") {						
		var f = obj.xLegend.font;
		if (f === undefined) {			
			f.size = 12;			
		}		      
		var legendPadding = 20;
        if (adjustableTextFontSize) {  
			f.size = getAdjustableLabelFontSize();
			legendPadding = getAdjustableLabelFontSize();
		}        				
		_xLegendSpace = +legendPadding + +f.size;
	}
	return _xLegendSpace;
}

function getLegendSpace() {
	var font = c.font;
	var _legendSpace = 20;
	if (typeof obj.legend !== "undefined") {         
		var x = hStep;		
		c.font = "bold 10px sans-serif";		
		if (adjustableTextFontSize) {
			c.font ="bold " + getAdjustableLabelFontSize() + "px sans-serif"; 
		}
        var legendPadding = 20;
		if (adjustableTextFontSize) {
			legendPadding = getAdjustableLabelFontSize()/2;
		}
		var legendY = getTitleSpace()+legendPadding;	
		for (var k=0; k<series; k++) {        			        
			var legendWidth = c.measureText(obj.legend[k]).width + 24;             			
			
			if (x + legendWidth > realWidth) {
				// draw legend on next line if does not fit on current one
				x = hStep;
				var lineSpace = 14;
				if (adjustableTextFontSize) {
					lineSpace = getAdjustableLabelFontSize();
				}	
				legendY = legendY + lineSpace;		
				var pad = 20;
				if (adjustableTextFontSize) {
					pad = getAdjustableLabelFontSize();
				}	
				_legendSpace += pad;				
			}    
											     
			x = x + legendWidth;			 
		} 
	}
	c.font = font;
	return _legendSpace;
}

function resizeCanvas() {
	var can = document.getElementById(idCan);
	if (can != null) {		
		var w = canWidth;
		if (resizeWidth) {
			if (!isPercent(w)) {
				w = "100%";
			}
		}
		var h = canHeight;
		if (resizeHeight) {
			if (!isPercent(h)) {
				h = "100%";
			}
		}
		updateSize(w, h);
		drawChart();
	}
}

function getAdjustableTitleFontSize() {
	return canvas.width/25;	
}

function getAdjustableLabelFontSize() {
	return canvas.width/45;	
}

drawLine(myjson, idCan, idTipCan, canWidth, canHeight);

};

/**** line chart utilities ****/
//return Y coordinates of the two ends of a line
//when we draw small dots with space between lines
function getLineY(dotY, dotY2, alpha, space) {
	var y, y2;
	if (dotY == dotY2) {
		y = dotY;
		y2 = dotY2;						
	} else if (dotY > dotY2) {
		y = dotY-space*Math.sin(alpha);
		y2 = dotY2 + space*Math.sin(alpha);
	} else if (dotY < dotY2){
		y = dotY+space*Math.sin(alpha);
		y2 = dotY2 - space*Math.sin(alpha);
	}
	return {y:y, y2:y2};
}

function drawDot(c, chartStyle, dotX, dotY, dotRadius, withFill) {
	c.beginPath();        	
  c.arc(dotX, dotY, dotRadius, 0, Math.PI * 2, true);    	    
  if (withFill) {
  	if (chartStyle == "hollowdot") {
  		c.stroke();
  	} else {
  		c.fill();
  	}
  }
}

function drawBow(c, dotX, dotY, withFill) {
	var d = 4;
	c.beginPath();
	c.moveTo(dotX, dotY);
	c.lineTo(dotX-d, dotY-d);
	c.lineTo(dotX+d, dotY-d);
	c.lineTo(dotX-d, dotY+d);
	c.lineTo(dotX+d, dotY+d);
	c.lineTo(dotX, dotY);
	if (withFill) {
		c.stroke();
	}
}

function drawAnchor(c, dotX, dotY, withFill) {
	var d = 8;
	c.beginPath();
	c.moveTo(dotX-d/2, dotY+Math.sqrt(3)*d/6);
	c.lineTo(dotX, dotY-2*Math.sqrt(3)*d/6);
	c.lineTo(dotX+d/2, dotY+Math.sqrt(3)*d/6);
	c.lineTo(dotX-d/2, dotY+Math.sqrt(3)*d/6);
	if (withFill) {
		c.stroke();
	}
}

//x of center, y of center, radius, number of points, fraction of radius for inset
function drawStar(c, x, y, r, p, m, withFill) {
  c.save();
  c.beginPath();
  c.translate(x, y);
  c.moveTo(0,0-r);
  for (var i = 0; i < p; i++) {
      c.rotate(Math.PI / p);
      c.lineTo(0, 0 - (r*m));
      c.rotate(Math.PI / p);
      c.lineTo(0, 0 - r);
  }
  if (withFill) {
  	c.stroke();
  }
  c.restore();
}

function drawLineElements(c, chartStyle, chartType, dotRadius, seriesColor, dotsK, dataLength, xaxisY, globalAlpha, k, i, dotX, dotY, dotX2, dotY2, withFill) {			
	
	var space = dotRadius+2;
	var y, y2, alpha;
	if (i < dataLength-1) {		
		alpha = Math.atan(Math.abs(dotY2-dotY)/Math.abs(dotX2-dotX));
	}
	var yy = getLineY(dotY, dotY2, alpha, space);
	c.strokeStyle = seriesColor[k];	
	c.fillStyle = seriesColor[k];		
	if (i < dataLength-1) {				
		c.beginPath();
		c.moveTo(dotX+space*Math.cos(alpha), yy.y);	
		c.lineTo(dotX2-space*Math.cos(alpha), yy.y2);	
	} else {
		if (chartType == "area") {					
			c.strokeStyle = highlightColor(seriesColor[k],1.3);
			c.beginPath();
			for (var i = 0; i < dotsK[k].length; i++) {
				var dot = dotsK[k][i];
				if (i == 0) {
					c.moveTo(dot.x, dot.y);
				} else {
					c.lineTo(dot.x, dot.y);
				}
		        
			}    	
			c.lineTo(dotX, xaxisY);				
			c.lineTo(dotsK[k][0].x ,xaxisY);
			c.lineTo(dotsK[k][0].x, dotsK[k][0].y);
			c.closePath();
			if (withFill) {
				c.globalAlpha = globalAlpha;
				c.fill();
				c.globalAlpha = 1;
			}			
		}
	}	
	
	if (withFill) {
		// dotX = dotX2 for last interval when we have no line to draw between two points
		if (dotX != dotX2) {
			c.lineWidth = 2;
			c.stroke();
		}
	}				
				
	c.lineWidth = 1;		    
	if ((chartStyle == "normal") || (chartStyle == "soliddot") || (chartStyle == "hollowdot")) {			
	    drawDot(c, chartStyle, dotX, dotY, dotRadius, withFill);		
	} else if (chartStyle == "bowdot") {						
		drawBow(c, dotX, dotY, withFill);
	} else if (chartStyle == "anchordot") {		
		drawAnchor(c, dotX, dotY, withFill);
	} else if (chartStyle == "stardot") {		
		drawStar(c, dotX, dotY,  5, 5, 0.5, withFill);		
	}
      	
}

/**** end line chart utilities****/