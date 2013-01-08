function setMouseDragHandler(root, rv) {
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	root.onmousedown = function(e) {
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
			rv.repaintAll();
		}
	}
	root.onmouseup = function(e) {
		if(flag) {
			shiftX += e.pageX - x0;
			shiftY += e.pageY - y0;
			dragX = 0;
			dragY = 0;
			rv.repaintAll();
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
	setMouseDragHander(root, rv);
	root.onresize = function(e) {
		rv.repaintAll();
	}
}

