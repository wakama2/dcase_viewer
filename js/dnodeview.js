var FONT_SIZE = 13;
var MIN_DISP_SCALE = 4 / FONT_SIZE;
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
			.css("left", $(document).width())//FIXME
			.css("fontSize", FONT_SIZE)
			.appendTo(viewer.$dom);

	if(node.isUndeveloped) {
		this.svgUndevel = $(document.createElementNS(SVG_NS, "polygon")).attr({
			fill: "none", stroke: "gray"
		}).appendTo(viewer.$svg);
	}
	this.argumentBorder = null;
	if(node.isArgument) {
		this.argumentBorder = $(document.createElementNS(SVG_NS, "rect")).attr({
			stroke: "#8080D0",
			fill: "none",
			"stroke-dasharray": 3,
		}).appendTo(viewer.$svg);
	}

	this.divName = $("<div></div>")
		.addClass("node-name")
		.html(node.name)
		.appendTo(this.div);
	this.divText = $("<div></div>")
		.addClass("node-text")
		.html(node.getHtmlDescription())
		.appendTo(this.div);
	this.divNodes = $("<div></div>")
		.addClass("node-closednodes")
		.appendTo(this.div);

	this.divNodesText = "";
	this.divNodesVisible = false;
	
	this.children = [];
	this.context = null;
	this.line = null;
	this.bounds = { x: 0, y: 0, w: DEF_WIDTH, h: 100 };
	this.argumentBounds = {};
	this.visible = true;
	this.childVisible = true;
	this.childOpen = true;
	this.edit = null;

	var touchinfo = {};
	this.div.mouseup(function(e) {
		if(self == viewer.getSelectedNode()) {
			self.showInplace();
		}
		viewer.dragEnd(self);
	}).dblclick(function(e) {
		if(self.edit != null) {
			self.edit.close();
		}
		viewer.expandBranch(self);
	}).bind("touchstart", function(e) {
		var touches = e.originalEvent.touches;
		touchinfo.count = touches.length;
	}).bind("touchend", function(e) {
		var DBLTOUCH_THRESHOLD = 300;
		viewer.dragEnd(self);
		if(touchinfo.time != null &&
				(new Date() - touchinfo.time) < DBLTOUCH_THRESHOLD) {
			viewer.expandBranch(self);
			touchinfo.time = null;
		}
		if(touchinfo.count == 1) {
			touchinfo.time = new Date();
		} else {
			touchinfo.time = null;
		}
	});
	//this.div.hover(function() {
	//	viewer.showToolbox(self);
	//}, function() {
	//	viewer.showToolbox(null);
	//});
};

var InplaceEditor = function(viewer, view, onClose) {
	var self = this;
	var node = view.node;
	var cc = 0;
	var $txt = $("<textarea></textarea>")
		.addClass("node-inplace")
		.css("top", view.divText.attr("top"))
		.attr("value", node.desc)
		.appendTo(view.div)
		.focus()
		.mousedown(function(e) { e.stopPropagation(); })
		.mouseup(function(e) { e.stopPropagation(); })
		.mousemove(function(e) { e.stopPropagation(); })
		.dblclick(function(e) {
			if(cc == 2) e.stopPropagation();
			cc = 0;
		})
		.click(function(e) { cc++; e.stopPropagation(); })
		.mousewheel(function(e) { e.stopPropagation(); })
		.blur(function() { self.close(); });

	view.divText.text("");

	this.close = function() {
		var newDesc = $txt.attr("value");
		if(node.desc != newDesc) {
			var op = new EditOperation(node, node.desc, newDesc);
			viewer.getArgument().applyOperation(op);
			setTimeout(function() {
				var b = view.svg.outer(200, view.divText.height() / viewer.scale + 60);
				view.bounds.h = b.h;
				viewer.repaintAll();
			}, 100);
		}
		view.divText.html(node.getHtmlDescription());
		$txt.remove();
		onClose();
	};
};

DNodeView.prototype.showInplace = function() {
	var self = this;
	if(this.edit == null) {
		this.edit = new InplaceEditor(this.viewer, this, function() {
			self.edit = null;
		});
	}
};

DNodeView.prototype.getTreeBounds = function() {
	return this.argumentBounds;
};

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
	var l;
	if(view.node.isContext) {
		l = this.viewer.createSvg("line");
		$(l).attr({
			fill: "none",
			stroke: "#404040",
			x1: 0, y1: 0, x2: 0, y2: 0,
			"marker-end": "url(#Triangle-white)",
		});
		this.context = view;
	} else {
		var l = this.viewer.createSvg("path");
		$(l).attr({
			fill: "none",
			stroke: "#404040",
			d: "M0,0 C0,0 0,0 0,0",
			"marker-end": "url(#Triangle-black)",
		});
		this.children.push(view);
	}
	view.line = l;
	this.divNodesText = this.node.getNodeCount() + " nodes...";
	this.divNodesVisible = true;
}

DNodeView.prototype.updateLocation = function(x, y) {
	var ARG_MARGIN = this.node.isArgument ? 5 : 0;
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
		if(this.visible && this.node.isUndeveloped) {
			h += 40;
		}
		if(this.node.isArgument) {
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
	if(this.node.isUndeveloped) {
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

DNodeView.prototype.animeStart = function(a, parent) {
	var self = this;
	var scale = this.viewer.scale;
	var b = this.bounds;
	a.show(this.svg.elems[0], this.visible);
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
	this.div.css("fontSize", Math.floor(FONT_SIZE * scale));

	this.svg.elems[0].setAttribute("fill", getColorByState(this.node));
	if(this.viewer.selectedNode == this) {
		this.svg.elems[0].setAttribute("stroke", "orange");
	} else {
		this.svg.elems[0].setAttribute("stroke", "none");
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
	
	if(this.line != null) {
		var l = this.line;
		var pb = parent.bounds;
		if(!this.node.isContext) {
			var start = l.pathSegList.getItem(0); // SVG_PATHSEG_MOVETO_ABS(M)
			var curve = l.pathSegList.getItem(1); // SVG_PATHSEG_CURVETO_CUBIC_ABS(C)
			var x1 = (pb.x + pb.w/2) * scale;
			var y1 = (pb.y + pb.h  ) * scale;
			var x2 = (b.x + b.w/2) * scale;
			var y2 = (b.y) * scale;
			a.show(l, parent.childVisible);
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
		} else {
			a.moves(l, {
				x1: (pb.x + pb.w  ) * scale,
				y1: (pb.y + pb.h/2) * scale,
				x2: (b.x) * scale,
				y2: (b.y + b.h/2) * scale,
			}).show(l, parent.childVisible);
		}
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
		var b = this.argumentBounds;
		a.moves(this.argumentBorder[0], {
			x     : b.x * scale,
			y     : b.y * scale,
			width : b.w * scale,
			height: b.h * scale,
		});
		a.show(this.argumentBorder[0], this.visible);
	}
	this.forEachNode(function(e) {
		e.animeStart(a, self);
	});
}

