DCaseViewer.prototype.setDragHandler = function() {
	var self = this;
	var x0 = 0;
	var y0 = 0;
	var flag = false;
	var bounds = {};

	this.dragStart = function(x, y) {
		if(flag) {
			this.dragCancel();
		}
		x0 = x;
		y0 = y;
		flag = true;
		var size = self.rootview.updateLocation(0, 0);
		bounds = {
			l : 20 - size.x * self.scale - self.shiftX,
			r : $(self.root).width() - 20 - self.shiftX,
			t : 20 - size.y * self.scale - self.shiftY,
			b : $(self.root).height() - 20 - self.shiftY
		};
		self.repaintAll(0);
	}
	this.drag = function(x, y, scale) {
		if(typeof scale == "undefined") scale = 1.0;
		if(flag) {
			var dx = (x - x0) * scale;
			var dy = (y - y0) * scale;
			if(dx != 0 || dy != 0) {
				self.showToolbox(null);
				self.dragX = Math.max(bounds.l, Math.min(bounds.r, dx));
				self.dragY = Math.max(bounds.t, Math.min(bounds.b, dy));
				self.repaintAll(0);
			}
		}
	}

	this.dragCancel = function() {
		self.shiftX += self.dragX;
		self.shiftY += self.dragY;
		self.dragX = 0;
		self.dragY = 0;
		self.repaintAll(0);
		flag = false;
	}

	this.dragEnd = function(view) {
		if(flag) {
			if(self.dragX == 0 && self.dragY == 0) {
				self.setSelectedNode(view);
			} else {
				self.shiftX += self.dragX;
				self.shiftY += self.dragY;
				self.dragX = 0;
				self.dragY = 0;
				self.repaintAll(0);
			}
			flag = false;
		}
	}
}

DCaseViewer.prototype.setMouseDragHandler = function() {
	var self = this;
	var root = this.root;
	$(root).mousedown(function(e) {
		if(e.originalEvent.detail == 2) return ;
		if(self.moving || !self.drag_flag) return ;
		self.dragStart(e.pageX, e.pageY);
	});
	$(root).mousemove(function(e) {
		self.drag(e.pageX, e.pageY);
		e.stopPropagation();
	});
	$(root).mouseup(function(e) {
		self.dragEnd();
	});
	$(root).mousewheel(function(e, delta) {
		e.preventDefault();
		if(self.moving) return;
		self.showToolbox(null);
		var b = 1.0 + delta * 0.04;
		self.scale = Math.min(Math.max(self.scale * b, SCALE_MIN), SCALE_MAX);
		if(self.scale != SCALE_MIN && self.scale != SCALE_MAX) {
			var r = root.getBoundingClientRect();
			var x1 = self.drag_flag ? e.pageX - r.left : $(root).width()/2;
			var y1 = self.drag_flag ? e.pageY - r.top  : $(root).height()/2;
			self.shiftX = x1 - (x1 - self.shiftX) * b;
			self.shiftY = y1 - (y1 - self.shiftY) * b;
		}
		self.repaintAll(0);
	});
}

DCaseViewer.prototype.setTouchHandler = function() {
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
			self.dragStart(x, y);
		} else
		if(touches.length == 2) {
			touchCount = 2;
			scale0 = self.scale;
			d = dist(touches[0].pageX - touches[1].pageX, 
					touches[0].pageY - touches[1].pageY);
			sx = self.shiftX;
			sy = self.shiftY;
			var x = (touches[0].pageX + touches[1].pageX) / 2 - r.left;
			var y = (touches[0].pageY + touches[1].pageY) / 2 - r.top;
			self.dragStart(x, y);
		}
	});
	$(root).bind("touchmove", function(e) {
		e.preventDefault();
		var touches = e.originalEvent.touches;
		if(touchCount == 1) {
			var x = touches[0].pageX;
			var y = touches[0].pageY;
			self.drag(x, y);
		} else
		if(touchCount == 2) {
			var a = dist(touches[0].pageX - touches[1].pageX, 
					touches[0].pageY - touches[1].pageY);
			self.scale = Math.min(Math.max(scale0 * (a / d), SCALE_MIN), SCALE_MAX);
			if(self.scale != SCALE_MIN && self.scale != SCALE_MAX) {
				var x1 = (touches[0].pageX + touches[1].pageX) / 2 - r.left;
				var y1 = (touches[0].pageY + touches[1].pageY) / 2 - r.top;
				self.shiftX = x1 - (x1 - sx) * (a / d);
				self.shiftY = y1 - (y1 - sy) * (a / d);
				self.drag(x1, y1, a / d);
			}
		}
	});
	$(root).bind("touchend", function(e) {
		e.preventDefault();
		self.dragEnd();
		touchCount = 0;
	});
}

DCaseViewer.prototype.addEventHandler = function() {
	this.setDragHandler();
	this.setMouseDragHandler();
	this.setTouchHandler();
}

