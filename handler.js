var Dragger = function(viewer) {
	var self = viewer;//FIXME
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	var bounds = {};

	this.dragStart = function(x, y) {
		if(flag) {
			this.dragEnd();
		}
		x0 = x;
		y0 = y;
		flag = true;
		var size = viewer.rootview.updateLocation(0, 0);
		bounds = {
			l : 20 - size.x * viewer.scale - self.shiftX,
			r : $(viewer.root).width() - 20 - self.shiftX,
			t : 20 - size.y * viewer.scale - self.shiftY,
			b : $(viewer.root).height() - 20 - self.shiftY
		};
	}
	this.drag = function(x, y, scale) {
		if(typeof scale == "undefined") scale = 1.0;
		if(flag) {
			var dx = (x - x0) * scale;
			var dy = (y - y0) * scale;
			self.dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
			self.dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
			viewer.repaintAll(0);
		}
	}
	this.dragEnd = function(view) {
		if(flag) {
			if(self.dragX == 0 && self.dragY == 0) {
				if(view != null) {
					viewer.rootview.updateLocation(0, 0);
					var x0 = view.bounds.x;
					view.setChildVisible(!view.childVisible);
					viewer.rootview.updateLocation(0, 0);
					var x1 = view.bounds.x;
					self.shiftX -= (x1-x0) * viewer.scale;
					viewer.repaintAll(ANIME_MSEC);
				}
			} else {
				self.shiftX += self.dragX;
				self.shiftY += self.dragY;
				self.dragX = 0;
				self.dragY = 0;
				viewer.repaintAll(0);
			}
			flag = false;
		}
	}
}

DCaseViewer.prototype.setMouseDragHandler = function(drag) {
	var self = this;
	var root = this.root;
	$(root).mousedown(function(e) {
		if(e.originalEvent.detail == 2) return;
		if(self.moving || !self.drag_flag) return;
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
		if(self.moving || !self.drag_flag) return;
		var b = delta < 0 ? 0.95 : 1.05;
		self.scale = Math.min(Math.max(self.scale * b, SCALE_MIN), SCALE_MAX);
		if(self.scale != SCALE_MIN && self.scale != SCALE_MAX) {
			var r = root.getBoundingClientRect();
			var x1 = e.pageX - r.left;
			var y1 = e.pageY - r.top;
			self.shiftX = x1 - (x1 - self.shiftX) * b;
			self.shiftY = y1 - (y1 - self.shiftY) * b;
		}
		self.repaintAll(0);
	});
}

DCaseViewer.prototype.setTouchHandler = function(drag) {
	var self = this;
	var root = this.root;
	var touchCount = 0;
	var d = 0;
	var scale0 = 0;
	var sx = 0;
	var sx = 0;
	var r = null;
	function dist(x, y) { return Math.sqrt(x*x + y*y); }
	$(root).bind("touchstart", function(e) {
		if(self.moving || !self.drag_flag) return;
		var touches = e.originalEvent.touches;
		e.preventDefault();
		r = root.getBoundingClientRect();
		if(touches.length == 1) {
			touchCount = 1;
			var x = touches[0].pageX;
			var y = touches[0].pageY;
			drag.dragStart(x, y);
		} else
		if(touches.length == 2) {
			touchCount = 2;
			scale0 = self.scale;
			d = dist(touches[0].pageX - touches[1].pageX, 
					touches[0].pageY - touches[1].pageY);
			sx0 = self.shiftX;
			sy0 = self.shiftY;
			var x = (touches[0].pageX + touches[1].pageX) / 2 - r.left;
			var y = (touches[0].pageY + touches[1].pageY) / 2 - r.top;
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
			self.scale = Math.min(Math.max(scale0 * (a / d), SCALE_MIN), SCALE_MAX);
			if(self.scale != SCALE_MIN && self.scale != SCALE_MAX) {
				var x1 = (touches[0].pageX + touches[1].pageX) / 2 - r.left;
				var y1 = (touches[0].pageY + touches[1].pageY) / 2 - r.top;
				self.shiftX = x1 - (x1 - sx0) * (a / d);
				self.shiftY = y1 - (y1 - sy0) * (a / d);
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

DCaseViewer.prototype.addEventHandler = function() {
	var drag = new Dragger(this);
	this.setMouseDragHandler(drag);
	this.setTouchHandler(drag);
}

