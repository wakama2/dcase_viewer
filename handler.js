var Dragger = function(viewer, root, rv) {
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	var bounds = {};

	function getDragLimit(rv) {
		var size = rv.updateLocation(0, 0);
		return {
			l : 20 - size.x * scale - shiftX,
			r : $(root).width() - 20 - shiftX,
			t : 20 - size.y * scale - shiftY,
			b : $(root).height() - 20 - shiftY
		};
	}

	this.dragStart = function(x, y) {
		if(flag) {
			this.dragEnd();
		}
		x0 = x;
		y0 = y;
		flag = true;
		bounds = getDragLimit(rv);
	}
	this.drag = function(x, y, scale) {
		if(typeof scale == "undefined") scale = 1.0;
		if(flag) {
			var dx = (x - x0) * scale;
			var dy = (y - y0) * scale;
			dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
			dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
			viewer.repaintAll(0);
		}
	}
	this.dragEnd = function(view) {
		if(flag) {
			if(dragX == 0 && dragY == 0) {
				if(typeof view != "undefined") {
					rv.updateLocation(0, 0);
					var x0 = view.bounds.x;
					view.setChildVisible(!view.childVisible);
					rv.updateLocation(0, 0);
					var x1 = view.bounds.x;
					shiftX -= (x1-x0) * scale;
					viewer.repaintAll(ANIME_MSEC);
				}
			} else {
				shiftX += dragX;
				shiftY += dragY;
				dragX = 0;
				dragY = 0;
				viewer.repaintAll(0);
			}
			flag = false;
		}
	}
}

DCaseViewer.prototype.setMouseDragHandler = function(drag, rv) {
	var self = this;
	var root = this.root;
	$(root).mousedown(function(e) {
		if(e.originalEvent.detail == 2) return;
		if(moving) return;
		drag.dragStart(e.pageX, e.pageY);
	});
	$(root).mousemove(function(e) {
		drag.drag(e.pageX, e.pageY);
	});
	$(root).mouseup(function(e) {
		drag.dragEnd();
	});
	$(".node-container").mouseup(function(e) {
		drag.dragEnd(this.dcaseview);
	});
	$(root).mousewheel(function(e, delta) {
		var b = delta < 0 ? 0.95 : 1.05;
		scale = Math.min(Math.max(scale * b, SCALE_MIN), SCALE_MAX);
		if(scale != SCALE_MIN && scale != SCALE_MAX) {
			var x1 = e.pageX;
			var y1 = e.pageY;
			shiftX = x1 - (x1 - shiftX) * b;
			shiftY = y1 - (y1 - shiftY) * b;
		}
		self.repaintAll(0);
	});
}

DCaseViewer.prototype.setTouchHandler = function(drag, rv) {
	var root = this.root;
	var touchCount = 0;
	var d = 0;
	var scale0 = 0;
	var sx = 0;
	var sx = 0;
	function dist(x, y) { return Math.sqrt(x*x + y*y); }
	$(root).bind("touchstart", function(e) {
		var touches = e.originalEvent.touches;
		if(moving) return;
		e.preventDefault();
		if(touches.length == 1) {
			touchCount = 1;
			var x = touches[0].pageX;
			var y = touches[0].pageY;
			drag.dragStart(x, y);
		} else
		if(touches.length == 2) {
			touchCount = 2;
			scale0 = scale;
			d = dist(touches[0].pageX - touches[1].pageX, 
					touches[0].pageY - touches[1].pageY);
			sx0 = shiftX;
			sy0 = shiftY;
			var x = (touches[0].pageX + touches[1].pageX) / 2;
			var y = (touches[0].pageY + touches[1].pageY) / 2;
			drag.dragStart(x, y);
		}
	});
	$(root).bind("touchmove", function(e) {
		e.preventDefault();
		var touches = e.originalEvent.touches;
		if(touchCount == 1) {
			var x = touches[0].pageX;
			var y = touches[0].pageY;
			drag.drag(x, y);
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
				drag.drag(x1, y1, a / d);
			}
		}
	});
	$(root).bind("touchend", function(e) {
		e.preventDefault();
		drag.dragEnd();
		touchCount = 0;
	});
	$(".node-container").bind("touchend", function(e) {
		drag.dragEnd(this.dcaseview);
		touchCount = 0;
	});
}

DCaseViewer.prototype.addEventHandler = function(rv) {
	var drag = new Dragger(this, this.root, rv);
	this.setMouseDragHandler(drag, rv);
	this.setTouchHandler(drag, rv);
}

