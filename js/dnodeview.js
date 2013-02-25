var FONT_SIZE = 13;
var MIN_DISP_SCALE = 4 / FONT_SIZE;
function toHTML(txt) {
	if(txt == "") {
		return "<font color=gray>(no description)</font>";
	}
	var x = txt
	.replace(/</g, "&lt;").replace(/>/g, "&gt;")
	.replace(/\n/g, "<br>");
	return x;
}

var DEF_WIDTH = 200;

/* class DNodeView */
var DNodeView = function(viewer, node) {
	var self = this;
	this.viewer = viewer;
	this.node = node;
	this.svg = new GsnShape[node.type](viewer);
	this.div = $("<div></div>")
			.addClass("node-container")
			.width(DEF_WIDTH)
			.appendTo(viewer.root);

	if(node.isUndevelop()) {
		this.svgUndevel = $(document.createElementNS(SVG_NS, "polygon")).attr({
			fill: "none", stroke: "gray"
		}).appendTo(viewer.svgroot);
	}
	this.argumentBorder = null;
	if(node.isArgument()) {
		this.argumentBorder = $(document.createElementNS(SVG_NS, "rect")).attr({
			stroke: "#8080D0",
			fill: "none",
			"stroke-dasharray": 3,
		}).appendTo(viewer.svgroot);
	}
	this.argumentBounds = {};

	this.divName = $("<div></div>").addClass("node-name").html(node.name);
	this.div.append(this.divName);

	this.divText = $("<div></div>").addClass("node-text").html(toHTML(node.text));
	this.div.append(this.divText);

	this.divNodes = $("<div></div>").addClass("node-closednodes");
	this.div.append(this.divNodes);

	this.divNodesText = "";
	this.divNodesVisible = false;
	
	this.childOpen = true;
	// child node
	this.children = [];
	this.context = null;
	// line
	this.lines = [];
	this.contextLine = null;
	// for animation
	this.bounds = { x: 0, y: 0, w: DEF_WIDTH, h: 100 };
	this.visible = true;
	this.childVisible = true;

	var touchinfo = {};
	this.div.mouseup(function(e) {
		viewer.dragEnd(self);
	}).dblclick(function(e) {
		viewer.actExpandBranch(self);
	}).bind("touchstart", function(e) {
		var touches = e.originalEvent.touches;
		touchinfo.count = touches.length;
	}).bind("touchend", function(e) {
		viewer.dragEnd(self);
		if(touchinfo.time != null && (new Date() - touchinfo.time) < 300) {
			viewer.actExpandBranch(self);
			touchinfo.time = null;
		}
		if(touchinfo.count == 1) {
			touchinfo.time = new Date();
		} else {
			touchinfo.time = null;
		}
	});
}

function getColorByState(node) {
	if(node.type == "Rebuttal") return "#FF8080";
	return node.isEvidence ? "#80FF80" : "#E0E0E0";
}

DNodeView.prototype.forEachNode = function(f) {
	if(this.context != null) {
		f(this.context);
	}
	var children = this.children;
	for(var i=0; i<children.length; i++) {
		f(children[i]);
	}
}

DNodeView.prototype.setChildVisible = function(b) {
	this.childVisible = b;
	this.childOpen = b;
	this.forEachNode(function(e) {
		e.setVisible(b);
	});
}

DNodeView.prototype.setVisible = function(b) {
	this.visible = b;
	if(b) {
		b = this.childOpen;
	}
	this.childVisible = b;
	this.forEachNode(function(e) {
		e.setVisible(b);
	});
}

DNodeView.prototype.addChild = function(view) {
	switch(view.node.type) {
	case "Context":
	case "Rebuttal":
	case "DScriptContext":
		var l = this.viewer.createSvg("line");
		$(l).attr({
			fill: "none",
			stroke: "#404040",
			x1: 0, y1: 0, x2: 0, y2: 0,
			"marker-end": "url(#Triangle-black)",
		});

		this.contextLine = l;
		this.context = view;
		break;
	default:
		var l = this.viewer.createSvg("path");
		$(l).attr({
			d: "M0,0 C0,0 0,0 0,0",
			fill: "none",
			stroke: "#404040",
			"marker-end": "url(#Triangle-black)",
		});

		this.lines.push(l);
		this.children.push(view);
		break;
	}
	this.divNodesText = (this.lines.length + (this.contextLine!=null?1:0))
			 + " nodes...";
	this.divNodesVisible = true;
}

DNodeView.prototype.updateLocation = function(x, y) {
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
		if(this.visible && this.node.isUndevelop()) {
			h += 40;
		}
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
			return { x: x+w, cx: x+w, y: y+h };
		} else {
			return { x: x, cx: x, y: y };
		}
	}
	// calc context height
	var contextHeight = 0;
	var childrenY = y0 + h + Y_MARGIN;
	if(this.context != null) {
		var cy = this.context.updateLocation(x, y).y;
		contextHeight = cy-y0;
		childrenY = Math.max(childrenY, cy + X_MARGIN);
	}
	var maxHeight = Math.max(contextHeight, h);

	// update children location
	var cx = x;
	$.each(this.children, function(i, e) {
		if(i != 0) x += X_MARGIN;
		var size = e.updateLocation(x, childrenY);
		x = size.x;
		cx = size.cx;
		maxHeight = Math.max(maxHeight, size.y - y0);
	});
	var maxWidth = Math.max(w, x - x0);
	var maxCWidth = Math.max(w, cx - x0);

	// update this location
	this.bounds = {
		x: x0 + (maxCWidth-w)/2,
		y: y0 + Math.max((contextHeight-h)/2, 0),
		w: w,
		h: h
	};

	// update context location
	if(this.context != null) {
		x = this.bounds.x + w + Y_MARGIN;
		y = y0 + Math.max((h - contextHeight) / 2, 0);
		var p = this.context.updateLocation(x, y);
		maxWidth = Math.max(maxWidth, p.x - x0);
	}
	if(this.node.isUndevelop()) {
		maxHeight += 40;
	}
	this.argumentBounds = {
		x: x0 - ARG_MARGIN,
		y: y0 - ARG_MARGIN,
		w: maxWidth + ARG_MARGIN * 2,
		h: maxHeight + ARG_MARGIN * 2
	};
	return {
		cx: x0 + maxCWidth + ARG_MARGIN,
		x: x0 + maxWidth + ARG_MARGIN,
		y: y0 + maxHeight + ARG_MARGIN,
	};
}

DNodeView.prototype.animeStart = function(a) {
	var self = this;
	var scale = this.viewer.scale;
	var b = this.bounds;
	var sr = this.svg[0] != null ? this.svg[0] : this.svg.elems[0];//TODO
	a.show(sr, this.visible);
	a.show(this.div, this.visible);
	a.show(this.divNodes, !this.childVisible);

	var offset = this.svg.animate(a, b.x * scale, b.y * scale,
			b.w * scale, b.h * scale, scale);
	a.moves(this.div, {
		left  : (b.x + offset.x) * scale,
		top   : (b.y + offset.y) * scale,
		width : (b.w - offset.x*2) * scale,
		height: (b.h - offset.y*2) * scale,
	});

	this.div.css("fontSize", Math.floor(FONT_SIZE*scale));

	sr.setAttribute("fill", getColorByState(this.node));
	if(this.viewer.selectedNode == this) {
		sr.setAttribute("stroke", "orange");
	} else {
		sr.setAttribute("stroke", "none");
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
		var start = l.pathSegList.getItem(0); // SVG_PATHSEG_MOVETO_ABS(M)
		var curve = l.pathSegList.getItem(1); // SVG_PATHSEG_CURVETO_CUBIC_ABS(C)
		
		var x1 = (b.x + b.w/2) * scale;
		var y1 = (b.y + b.h  ) * scale;
		var x2 = (e.bounds.x + e.bounds.w/2) * scale;
		var y2 = (e.bounds.y) * scale;

		a.show(l, self.childVisible);
	
		a.moves(start, {
			x: x1,
			y: y1,
		});
		a.moves(curve, {
			x1: (9 * x1 + x2) / 10,
			y1: (y1 + y2) / 2,
			x2: (9 * x2 + x1) / 10,
			y2: (y1 + y2) / 2,
			x: x2,
			y: y2,
		});
	});
	if(this.contextLine != null) {
		var e = self.context;
		var l = self.contextLine;
		a.moves(l, {
			x1: (b.x + b.w  ) * scale,
			y1: (b.y + b.h/2) * scale,
			x2: (e.bounds.x) * scale,
			y2: (e.bounds.y + e.bounds.h/2) * scale,
		}).show(l, self.childVisible);
	}
	if(this.svgUndevel != null) {
		var sx = (b.x + b.w/2) * scale;
		var sy = (b.y + b.h) * scale;
		var n = 20 * scale;
		a.show(this.svgUndevel.context, this.visible);
		a.movePolygon(this.svgUndevel.context, [
			{ x: sx, y: sy },
			{ x: sx-n, y: sy+n },
			{ x: sx, y: sy+n*2 },
			{ x: sx+n, y: sy+n },
		]);
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
		e.animeStart(a);
	});
}

