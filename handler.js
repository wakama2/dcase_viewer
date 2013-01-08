function setMouseDragHandler(root, rv) {
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	root.onmousedown = function(e) {
		console.log("root down");
		x0 = e.pageX;
		y0 = e.pageY;
		flag = true;
	}
	root.onmousemove = function(e) {
		if(flag) {
			var dx = e.pageX - x0;
			var dy = e.pageY - y0;
			dragX = dx;
			dragY = dy;
			rv.repaintAll(0);
		}
	}
	root.onmouseup = function(e) {
		console.log("root up");
		if(flag) {
			shiftX += dragX;
			shiftY += dragY;
			dragX = 0;
			dragY = 0;
			rv.repaintAll(0);
			flag = false;
		}
	}
}

function setTouchHandler(root, rv) {
	var touchCount = 0;
	var d = 0;
	var scale0 = 0;
	var sx0 = 0;
	var sy0 = 0;
	var x0 = 0;
	var y0 = 0;
	function dist(x, y) { return Math.sqrt(x*x + y*y); }
	root.ontouchstart = function(e) {
		e.preventDefault();
		if(e.touches.length == 1) {
			touchCount = 1;
			x0 = e.touches[0].pageX;
			y0 = e.touches[0].pageY;
		} else
		if(e.touches.length == 2) {
			touchCount = 2;
			scale0 = scale;
			d = dist(e.touches[0].pageX - e.touches[1].pageX, 
					e.touches[0].pageY - e.touches[1].pageY);
			sx0 = shiftX;// + ($(rootcv).width()-rv.updateLocation(0, 0).x)/2;
			sy0 = shiftY;
		}
	}
	root.ontouchmove = function(e) {
		e.preventDefault();
		if(touchCount == 1) {
			var dx = e.touches[0].pageX - x0;
			var dy = e.touches[0].pageY - y0;
			dragX = dx;
			dragY = dy;
			rv.repaintAll(0);
		} else
		if(touchCount == 2) {
			var a = dist(e.touches[0].pageX - e.touches[1].pageX, 
					e.touches[0].pageY - e.touches[1].pageY);
			scale = Math.max(scale0 * (a / d), SCALE_MIN);
			var x1 = (e.touches[0].pageX + e.touches[1].pageX) / 2;
			var y1 = (e.touches[0].pageY + e.touches[1].pageY) / 2;
			shiftX = x1 - (x1 - sx0) * (a / d);
			shiftY = y1 - (y1 - sy0) * (a / d);
			rv.repaintAll(0);
		}
	}
	root.ontouchend = function(e) {
		e.preventDefault();
		if(touchCount == 1) {
			shiftX += dragX;
			shiftY += dragY;
			dragX = 0;
			dragY = 0;
			rv.repaintAll(0);
		} else
		if(touchCount == 2) {
			rv.repaintAll(0);
		}
		touchCount = 0;
	}
}

function setEventHandler(root, rv) {
	setMouseDragHandler(root, rv);
	setTouchHandler(root, rv);
	root.onresize = function(e) {
		rv.repaintAll(ANIME_MSEC);
	}
}

