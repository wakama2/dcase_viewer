var FONT_SIZE = 13;
var MIN_DISP_SCALE = 4 / FONT_SIZE;

function newGSNObject(root, type) {
	var o = null;
	if(type == "Goal") {
		var n = 10;
		o = root.createSvg("rect");
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("x", x);
			this.setAttribute("y", y);
			this.setAttribute("width", w);
			this.setAttribute("height", h);
		}
		o.offset = { x: n, y: n };
	} else if(type == "Context") {
		o = root.createSvg("rect");
		var n = 20;
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("rx", n * root.scale);
			this.setAttribute("ry", n * root.scale);
			this.setAttribute("x", x);
			this.setAttribute("y", y);
			this.setAttribute("width", w);
			this.setAttribute("height", h);
		}
		o.offset = { x: n/2, y: n/2 };
	} else if(type == "Strategy") {
		o = root.createSvg("polygon");
		o.setBounds = function(x, y, w, h) {
			var n = 20 * root.scale;
			this.setAttribute("points", 
					(x+n)+","+y+" "+(x+w)+","+y+" "+(x+w-n)+","+(y+h)+" "+x+","+(y+h));
		}
		o.offset = { x: 25, y: 10 };
	} else if(type == "Evidence" || type == "Monitor") {
		o = root.createSvg("ellipse");
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("cx", x + w/2);
			this.setAttribute("cy", y + h/2);
			this.setAttribute("rx", w/2);
			this.setAttribute("ry", h/2);
			o.offset = { x: w/6/root.scale, y: h/6/root.scale };
		}
		o.offset = { x: 0, y: 0 };
	} else {
		throw type + " is not GSN type";
	}
	return o;
}

function getColorByState(node) {
	return node.isEvidence ? "#80FF80" : "#E0E0E0";
}

/* class View */
var View = function(viewer, node) {
	var self = this;
	this.viewer = viewer;
	this.node = node;
	this.svg = newGSNObject(viewer, node.type);
	this.div = $("<div></div>").addClass("node-container");
	viewer.appendElem(this.div);

	this.div.mouseup(function(e) {
		viewer.dragEnd(self);
	}).dblclick(function(e) {
		if(node.isDScript()) {
			viewer.showDScriptExecuteWindow(node.getDScriptNameInEvidence());
		} else {
			viewer.actExpandBranch(self);
		}
	}).bind("touchend", function(e) {
		viewer.dragEnd(self);
	});
	if(node.isUndevelop()) {
		this.svgUndevel = $(document.createElementNS(SVG_NS, "polygon")).attr({
			fill: "none", stroke: "gray"
		});
		viewer.appendSvg(this.svgUndevel)
	}
	this.argumentBorder = null;
	if(node.isArgument()) {
		this.argumentBorder = $(document.createElementNS(SVG_NS, "rect")).attr({
			stroke: "#8080D0",
			fill: "none",
			"stroke-dasharray": 3,
		});
		viewer.appendSvg(this.argumentBorder);
	}
	this.argumentBounds = {};

	this.divName = $("<div></div>").addClass("node-name").html(node.name);
	this.div.append(this.divName);

	this.divText = $("<div></div>").addClass("node-text").html(node.text);
	this.div.append(this.divText);

	this.divNodes = $("<div></div>").addClass("node-closednodes");
	this.div.append(this.divNodes);

	this.divNodesText = "";
	this.divNodesVisible = false;
	
	this.childOpen = true;
	// child node
	this.context = null;
	this.children = [];
	// line
	this.lines = [];
	this.contextLine = null;
	// for animation
	this.div.width(200);
	this.bounds = { x: 0, y: 0, w: 200, h: this.div.height() + 60 };
	this.visible = true;
	this.childVisible = true;
	this.bounds0 = this.bounds;
}

View.prototype.modified = function() {
	this.divName.html(this.node.name);
	this.divText.html(this.node.text);
	this.viewer.repaintAll();
}

View.prototype.forEachNode = function(f) {
	if(this.context != null) {
		f(this.context);
	}
	var children = this.children;
	for(var i=0; i<children.length; i++) {
		f(children[i]);
	}
}

View.prototype.setChildVisible = function(b) {
	this.childVisible = b;
	this.childOpen = b;
	this.forEachNode(function(e) {
		e.setVisible(b);
	});
}

View.prototype.setVisible = function(b) {
	this.visible = b;
	if(b) {
		b = this.childOpen;
	}
	this.childVisible = b;
	this.forEachNode(function(e) {
		e.setVisible(b);
	});
}

View.prototype.addChild = function(view) {
	var l = this.viewer.createSvg("line");
	$(l).attr({
		stroke: "#404040",
		x1: 0, y1: 0, x2: 0, y2: 0
	});
	if(view.node.type != "Context") {
		this.lines.push(l);
		this.children.push(view);
	} else {
		this.contextLine = l;
		this.context = view;
	}
	this.divNodesText = (this.lines.length + (this.contextLine!=null?1:0))
			 + " nodes...";
	this.divNodesVisible = true;
}

View.prototype.updateLocation = function(x, y) {
	var ARG_MARGIN = this.node.isArgument() ? 5 : 0;
	x += ARG_MARGIN;
	y += ARG_MARGIN;
	var x0 = x;
	var y0 = y;
	var w = this.bounds.w;
	var h = this.bounds.h;
	if(!this.visible || !this.childVisible) {
		this.forEachNode(function(e) {
			e.updateLocation(x, y);
		});
		this.bounds = { x: x, y: y, w: w, h: h };
		if(this.node.isArgument()) {
			this.argumentBounds = {
				x: x0 - ARG_MARGIN,
				y: y0 - ARG_MARGIN,
				w: w + ARG_MARGIN * 2,
				h: h + ARG_MARGIN * 2
			};
			w += ARG_MARGIN;
			h += ARG_MARGIN;
		}
		if(this.visible) {
			return { x: x+w, y: y+h };
		} else {
			return { x: x, y: y };
		}
	}
	// calc context height
	var contextHeight = h;
	var childrenY = y0 + h + Y_MARGIN;
	if(this.context != null) {
		var cy = this.context.updateLocation(x, y).y;
		contextHeight = Math.max(contextHeight, cy-y0);
		childrenY = Math.max(childrenY, cy + X_MARGIN);
	}
	var maxHeight = contextHeight;

	// update children location
	$.each(this.children, function(i, e) {
		if(i != 0) x += X_MARGIN;
		var size = e.updateLocation(x, childrenY);
		x = size.x;
		maxHeight = Math.max(maxHeight, size.y - y0);
	});
	var maxWidth = Math.max(w, x - x0);

	// update this location
	this.bounds = {
		x: x0 + (maxWidth-w)/2,
		y: y0 + (contextHeight-h)/2,
		w: w,
		h: h
	};

	// update context location
	if(this.context != null) {
		x = this.bounds.x + w + Y_MARGIN;
		y = y0;
		var p = this.context.updateLocation(x, y);
		maxWidth = Math.max(maxWidth, p.x - x0);
	}
	this.argumentBounds = {
		x: x0 - ARG_MARGIN,
		y: y0 - ARG_MARGIN,
		w: maxWidth + ARG_MARGIN * 2,
		h: maxHeight + ARG_MARGIN * 2
	};
	return { x: x0 + maxWidth + ARG_MARGIN, y: y0 + maxHeight + ARG_MARGIN };
}

View.prototype.animeBegin = function(a) {
	var self = this;
	var scale = this.viewer.scale;
	a.show(this.svg, this.visible);
	a.show(this.div, this.visible);
	a.show(this.divNodes, !this.childVisible);

	a.moves(this.div, {
		left  : (this.bounds.x + this.svg.offset.x) * scale,
		top   : (this.bounds.y + this.svg.offset.y) * scale,
		width : (this.bounds.w - this.svg.offset.x*2) * scale,
		height: (this.bounds.h - this.svg.offset.y*2) * scale,
		fontSize: FONT_SIZE*scale,
	});

	this.svg.setAttribute("fill", getColorByState(this.node));
	if(this.viewer.selectedNode == this) {
		this.svg.setAttribute("stroke", "orange");
	} else {
		this.svg.setAttribute("stroke", "none");
	}
	if(scale < MIN_DISP_SCALE) {
		a.show(this.divText, false);
		a.show(this.divName, false);
		if(this.divNodesVisible) {
			this.divNodes.html("<p></p>");
		}
	} else {
		a.show(this.divText, true);
		a.show(this.divName, true);
		if(this.divNodesVisible) {
			this.divNodes.html(this.divNodesText);
		}
	}
	
	$.each(this.lines, function(i, l) {
		var e = self.children[i];
		a.moves(l, {
			x1: (self.bounds.x + self.bounds.w/2) * scale,
			y1: (self.bounds.y + self.bounds.h  ) * scale,
			x2: (e.bounds.x + e.bounds.w/2) * scale,
			y2: (e.bounds.y) * scale,
		}).show(l, self.childVisible);
	});
	if(this.contextLine != null) {
		var e = self.context;
		var l = self.contextLine;
		a.moves(l, {
			x1: (self.bounds.x + self.bounds.w  ) * scale,
			y1: (self.bounds.y + self.bounds.h/2) * scale,
			x2: (e.bounds.x) * scale,
			y2: (e.bounds.y + e.bounds.h/2) * scale,
		}).show(l, self.childVisible);
	};
	if(this.svgUndevel != null) {
		a.show(this.svgUndevel.context, this.visible);
	}
	if(this.argumentBorder != null) {
		var n = 10;
		var b = this.argumentBorder.context;
		a.moves(b, {
			x     : this.argumentBounds.x * scale,
			y     : this.argumentBounds.y * scale,
			width : this.argumentBounds.w * scale,
			height: this.argumentBounds.h * scale,
		}).show(b, this.visible);
	}
	this.forEachNode(function(e) {
		e.animeBegin(a);
	});
}

View.prototype.setBounds = function(x, y, w, h) {
	var scale = this.viewer.scale;
	this.svg.setBounds(x * scale, y * scale, w * scale, h * scale);
	if(this.node.isUndevelop()) {
		var sx = (x + w/2) * scale;
		var sy = (y + h) * scale;
		var n = 20 * scale;
		function s(x, y) { return x+","+y }
		this.svgUndevel.attr("points", 
			s(sx, sy) + " " + s(sx+n, sy+n) + " " + s(sx, sy+n*2) + " " + s(sx-n, sy+n));
	}
}

View.prototype.animate = function(r) {
	function mid(x0, x1) { return (x1-x0) * r + x0; }
	this.setBounds(
			mid(this.bounds0.x, this.bounds.x), mid(this.bounds0.y, this.bounds.y),
			mid(this.bounds0.w, this.bounds.w), mid(this.bounds0.h, this.bounds.h));
	this.forEachNode(function(e) {
		e.animate(r);
	});
}

View.prototype.move = function() {
	this.setBounds(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
	this.forEachNode(function(e) {
		e.move();
	});
	this.bounds0 = this.bounds;
}

