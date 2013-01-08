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
			dragX = dx / scale;
			dragY = dy / scale;
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
	root.ontouchstart = function(e) {
		e.preventDefault();
		if(e.touches.length == 1) {

			touchCount = 1;
		}
	}
	root.ontouchmove = function(e) {
		e.preventDefault();

	}
	root.ontouchend = function(e) {
		e.preventDefault();
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

