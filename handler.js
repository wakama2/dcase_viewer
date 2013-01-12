var Dragger = function(rv) {
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	var bounds = {};

	this.dragStart = function(x, y) {
		if(flag) {
			//TODO
		}
		x0 = x;
		y0 = y;
		flag = true;
		bounds = getDragLimit(rv);
	}
	this.drag = function(x, y) {
		if(flag) {
			var dx = x - x0;
			var dy = y - y0;
			dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
			dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
			rv.repaintAll(0);
		}
	}
	this.dragEnd = function(view) {
		if(flag) {
			if(dragX == 0 && dragY == 0) {
				if(view != null) {
					rv.updateLocation(0, 0);
					var x0 = view.bounds.x;
					view.setChildVisible(!view.childVisible);
					rv.updateLocation(0, 0);
					var x1 = view.bounds.x;
					shiftX -= (x1-x0) * scale;
					view.repaintAll(ANIME_MSEC);
				}
			} else {
				shiftX += dragX;
				shiftY += dragY;
				dragX = 0;
				dragY = 0;
				rv.repaintAll(0);
			}
			flag = false;
		}

	}
}

function getDragLimit(rv) {
	var root = $(".viewer-root");
	var size = rv.updateLocation(0, 0);
	return {
		l : 20 - size.x * scale - shiftX,
		r : root.width() - 20 - shiftX,
		t : 20 - size.y * scale - shiftY,
		b : root.height() - 20 - shiftY
	};
}

function setMouseDragHandler(dragInfo, rv) {
	$(".viewer-root").mousedown(function(e) {
		if(e.originalEvent.detail == 2) return;
		if(moving) return;
		dragInfo.dragStart(e.pageX, e.pageY);
	});
	$(".viewer-root").mousemove(function(e) {
		dragInfo.drag(e.pageX, e.pageY);
	});
	$(".viewer-root").mouseup(function(e) {
		dragInfo.dragEnd(null);
	});
	$(".node-container").mouseup(function(e) {
		dragInfo.dragEnd(this.dcaseview);
	});
	$(".viewer-root").mousewheel(function(e, delta) {
		var b = delta < 0 ? 0.95 : 1.05;
		scale = Math.min(Math.max(scale * b, SCALE_MIN), SCALE_MAX);
		if(scale != SCALE_MIN && scale != SCALE_MAX) {
			var x1 = e.pageX;
			var y1 = e.pageY;
			shiftX = x1 - (x1 - shiftX) * b;
			shiftY = y1 - (y1 - shiftY) * b;
		}
		rv.repaintAll(0);
	});
}

function setTouchHandler(dragInfo, rv) {
	var touchCount = 0;
	var d = 0;
	var scale0 = 0;
	var x0 = 0;
	var y0 = 0;
	var sx = 0;
	var sx = 0;
	var bounds = {};
	function dist(x, y) { return Math.sqrt(x*x + y*y); }
	$(".viewer-root").bind("touchstart", function(e) {
		var touches = e.originalEvent.touches;
		if(moving) return;
		e.preventDefault();
		if(touches.length == 1) {
			touchCount = 1;
			x0 = touches[0].pageX;
			y0 = touches[0].pageY;
			bounds = getDragLimit(rv);
		} else
		if(touches.length == 2) {
			touchCount = 2;
			scale0 = scale;
			x0 = (touches[0].pageX + touches[1].pageX) / 2;
			y0 = (touches[0].pageY + touches[1].pageY) / 2;
			d = dist(touches[0].pageX - touches[1].pageX, 
					touches[0].pageY - touches[1].pageY);
			sx0 = shiftX;
			sy0 = shiftY;
		}
	});
	$(".viewer-root").bind("touchmove", function(e) {
		e.preventDefault();
		var touches = e.originalEvent.touches;
		if(touchCount == 1) {
			var dx = touches[0].pageX - x0;
			var dy = touches[0].pageY - y0;
			dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
			dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
			rv.repaintAll(0);
		} else
		if(touchCount == 2) {
			var a = dist(touches[0].pageX - touches[1].pageX, 
					touches[0].pageY - touches[1].pageY);
			scale = Math.min(Math.max(scale0 * (a / d), SCALE_MIN), SCALE_MAX);
			if(scale != SCALE_MIN && scale != SCALE_MAX) {
				var x1 = (touches[0].pageX + touches[1].pageX) / 2;
				var y1 = (touches[0].pageY + touches[1].pageY) / 2;
				shiftX = x1 - (x1 - sx0) * (a / d);
				shiftY = y1 - (y1 - sy0) * (a / d);

				var dx = (x1 - x0) * (a / d);
				var dy = (y1 - y0) * (a / d);
				dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
				dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
				rv.repaintAll(0);
			}
		}
	});
	$(".viewer-root").bind("touchend", function(e) {
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
	});
	$(".node-container").bind("touchend", function(e) {
	//View.prototype.elementTouchEnd = function(e) {
		if(touchCount == 1 && dragX == 0 && dragY == 0) {
			touchCount = 0;
			rv.updateLocation(0, 0);
			var view = this.dcaseview;
			var x0 = view.bounds.x;
			view.setChildVisible(!view.childVisible);
			rv.updateLocation(0, 0);
			var x1 = view.bounds.x;
			shiftX -= (x1-x0) * scale;
			view.repaintAll(ANIME_MSEC);
		}
	});
}

function setEventHandler(rv) {
	var dragInfo = new Dragger(rv);
	setMouseDragHandler(dragInfo, rv);
	setTouchHandler(dragInfo, rv);
	//root.onresize = function(e) {
	//}
}

