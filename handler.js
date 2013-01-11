function getDragLimit(root, rv) {
	var size = rv.updateLocation(0, 0);
	return {
		l : 20 - size.x * scale - shiftX,
		r : $(root).width() - 20 - shiftX,
		t : 20 - size.y * scale - shiftY,
		b : $(root).height() - 20 - shiftY
	};
}

function setMouseDragHandler(root, rv) {
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	var bounds = {};
	root.onmousedown = function(e) {
		if(e.detail == 2) return;
		if(moving) return;
		x0 = e.pageX;
		y0 = e.pageY;
		flag = true;
		bounds = getDragLimit(root, rv);
	}
	root.onmousemove = function(e) {
		if(flag) {
			var dx = e.pageX - x0;
			var dy = e.pageY - y0;
			dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
			dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
			rv.repaintAll(0);
		}
	}
	root.onmouseup = function(e) {
		if(flag) {
			shiftX += dragX;
			shiftY += dragY;
			dragX = 0;
			dragY = 0;
			if(dragX == 0 && dragY == 0) {
				rv.repaintAll(0);
			}
			flag = false;
		}
	}
	View.prototype.elementMouseUp = function(e) {
		if(flag && dragX == 0 && dragY == 0) {
			flag = false;
			rv.updateLocation(0, 0);
			var x0 = this.bounds.x;
			this.setChildVisible(!this.childVisible);
			rv.updateLocation(0, 0);
			var x1 = this.bounds.x;
			shiftX -= (x1-x0) * scale;
			this.repaintAll(ANIME_MSEC);
		}
	}
	root.addEventListener("DOMMouseScroll", function(e) {
		var delta = e.detail;
		var b = delta > 0 ? 0.9 : 1.1;
		scale = Math.min(Math.max(scale * b, SCALE_MIN), SCALE_MAX);
		if(scale != SCALE_MIN && scale != SCALE_MAX) {
			var x1 = e.pageX;
			var y1 = e.pageY;
			shiftX = x1 - (x1 - shiftX) * b;
			shiftY = y1 - (y1 - shiftY) * b;
		}
		rv.repaintAll(0);
	}, false);
}

function setTouchHandler(root, rv) {
	var touchCount = 0;
	var d = 0;
	var scale0 = 0;
	var x0 = 0;
	var y0 = 0;
	var sx = 0;
	var sx = 0;
	var bounds = {};
	function dist(x, y) { return Math.sqrt(x*x + y*y); }
	root.ontouchstart = function(e) {
		if(moving) return;
		e.preventDefault();
		if(e.touches.length == 1) {
			touchCount = 1;
			x0 = e.touches[0].pageX;
			y0 = e.touches[0].pageY;
			bounds = getDragLimit(root, rv);
		} else
		if(e.touches.length == 2) {
			touchCount = 2;
			scale0 = scale;
			x0 = (e.touches[0].pageX + e.touches[1].pageX) / 2;
			y0 = (e.touches[0].pageY + e.touches[1].pageY) / 2;
			d = dist(e.touches[0].pageX - e.touches[1].pageX, 
					e.touches[0].pageY - e.touches[1].pageY);
			sx0 = shiftX;
			sy0 = shiftY;
		}
	}
	root.ontouchmove = function(e) {
		e.preventDefault();
		if(touchCount == 1) {
			var dx = e.touches[0].pageX - x0;
			var dy = e.touches[0].pageY - y0;
			dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
			dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
			rv.repaintAll(0);
		} else
		if(touchCount == 2) {
			var a = dist(e.touches[0].pageX - e.touches[1].pageX, 
					e.touches[0].pageY - e.touches[1].pageY);
			scale = Math.min(Math.max(scale0 * (a / d), SCALE_MIN), SCALE_MAX);
			if(scale != SCALE_MIN && scale != SCALE_MAX) {
				var x1 = (e.touches[0].pageX + e.touches[1].pageX) / 2;
				var y1 = (e.touches[0].pageY + e.touches[1].pageY) / 2;
				shiftX = x1 - (x1 - sx0) * (a / d);
				shiftY = y1 - (y1 - sy0) * (a / d);

				var dx = (x1 - x0) * (a / d);
				var dy = (y1 - y0) * (a / d);
				dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
				dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
				rv.repaintAll(0);
			}
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
			shiftX += dragX;
			shiftY += dragY;
			dragX = 0;
			dragY = 0;
			rv.repaintAll(0);
		}
		touchCount = 0;
	}
	View.prototype.elementTouchEnd = function(e) {
		if(touchCount == 1 && dragX == 0 && dragY == 0) {
			touchCount = 0;
			rv.updateLocation(0, 0);
			var x0 = this.bounds.x;
			this.setChildVisible(!this.childVisible);
			rv.updateLocation(0, 0);
			var x1 = this.bounds.x;
			shiftX -= (x1-x0) * scale;
			this.repaintAll(ANIME_MSEC);
		}
	}
}

function setEventHandler(root, rv) {
	setMouseDragHandler(root, rv);
	setTouchHandler(root, rv);
	//root.onresize = function(e) {
	//}
}

