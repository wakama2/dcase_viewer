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
			//width: 2px, dashed
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
	
	this.location = { x: 0, y: 0 };
	this.childOpen = true;
	// child node
	this.contexts = [];
	this.children = [];
	// line
	this.lines = [];
	this.contextLines = [];
	// for animation
	this.div.width(200);
	this.bounds = { x: 0, y: 0, w: 200, h: this.div.height() + 60 };
	this.visible = true;
	this.childVisible = true;
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;
}

View.prototype.modified = function() {
	this.divName.html(this.node.name);
	this.divText.html(this.node.text);
	this.viewer.repaintAll();
}

View.prototype.getX = function() { return this.location.x; }
View.prototype.getY = function() { return this.location.y; }

View.prototype.forEachNode = function(f) {
	var contexts = this.contexts;
	for(var i=0; i<contexts.length; i++) {
		f(contexts[i]);
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
		this.contextLines.push(l);
		this.contexts.push(view);
	}
	this.divNodesText = (this.lines.length + this.contextLines.length) + " nodes...";
	this.divNodesVisible = true;
}

View.prototype.setBounds = function(x, y, w, h) {
	this.location = { x: x, y: y };
	var scale = this.viewer.scale;
	this.svg.setBounds(x * scale, y * scale, w * scale, h * scale);
	this.div.css({
		left  : (x + this.svg.offset.x) * scale + "px",
		top   : (y + this.svg.offset.y) * scale + "px",
		width : (w - this.svg.offset.x * 2) * scale + "px",
		height: (h - this.svg.offset.y * 2) * scale + "px",
		fontSize: Math.round(FONT_SIZE * scale) + "px",
	});
	if(this.node.isUndevelop()) {
		var sx = (x + w/2) * scale;
		var sy = (y + h) * scale;
		var n = 20 * scale;
		function s(x, y) { return x+","+y }
		this.svgUndevel.attr("points", 
			s(sx, sy) + " " + s(sx+n, sy+n) + " " + s(sx, sy+n*2) + " " + s(sx-n, sy+n));
	}
}

View.prototype.updateLocation = function(x, y) {
	var x0 = x;
	var y0 = y;
	var w = this.bounds.w;
	var h = this.bounds.h;
	if(!this.visible || !this.childVisible) {
		this.forEachNode(function(e) {
			e.updateLocation(x, y);
		});
		this.bounds = { x: x, y: y, w: w, h: h };
		if(this.visible) {
			this.argumentBounds = { x:x0, y:y0, x1:w, y1:h };
			return { x: x+w, y: y+h };
		} else {
			this.argumentBounds = { x:x0, y:y0, x1:x-x0, y1:y-y0 };
			return { x: x, y: y };
		}
	}
	// contents
	if(this.node.contexts.length != 0) {
		var contexts = this.contexts;
		for(var i=0; i<contexts.length; i++) {
			var e = contexts[i];
			y = e.updateLocation(x, y).y + X_MARGIN;
		}
		y -= X_MARGIN;
	}
	y = Math.max(y0 + h + Y_MARGIN, y + X_MARGIN);
	var y1 = y;

	// children
	if(this.node.children.length != 0) {
		var children = this.children;
		for(var i=0; i<children.length; i++) {
			var e = children[i];
			var size = e.updateLocation(x, y);
			x = size.x + X_MARGIN;
			y1 = Math.max(y1, size.y);
		}
		x -= X_MARGIN;
	} else {
		y -= Y_MARGIN;
		y1 -= Y_MARGIN;
	}
	x = Math.max(x0 + w, x);
	var x1 = x;

	// set this bounds
	this.bounds = { x: x0 + (x-x0-w)/2, y: y0, w: w, h: h };

	// contents (second)
	x = this.bounds.x + w + Y_MARGIN;
	y = y0;
	var contexts = this.contexts;
	for(var i=0; i<contexts.length; i++) {
		var e = contexts[i];
		var p = e.updateLocation(x, y);
		x1 = Math.max(x1, p.x);
		y = p.y + X_MARGIN;
	}
	
	x = Math.max(x1, this.bounds.x + w);
	y = Math.max(y1, this.bounds.y + h);
	this.argumentBounds = { x:x0, y:y0, x1:x-x0, y1:y-y0 };
	return { x: x, y: y };
}

View.prototype.animeBegin = function() {
	var animCss = [];
	var animSvg = [];

	function anime(dom, key, fromValue, toValue) {
		animSvg.push({
			dom: dom,
			prop: key,
			from: fromValue,
			to: parseInt(toValue)
		});
	}
	function animeTo(dom, key, toValue) {
		anime(dom, key, parseInt(dom.getAttribute(key)), toValue);
	}

	if(this.visible != this.visible0) {
		if(this.visible) {
			this.svg.setAttribute("display", "block");
			this.div.css("display", "block");
			animCss.push({ dom: this.div, prop: "opacity", from: 0, to: 1 });
			anime(this.svg, "opacity", 0, 1);
		} else {
			animCss.push({ dom: this.div, prop: "opacity", from: 1, to: 0 });
			anime(this.svg, "opacity", 1, 0);
		}
	}
	this.divNodes.css("display", !this.childVisible ? "block" : "none");
	this.forEachNode(function(e) {
		e.animeBegin();
	});
	var self = this;
	var scale = this.viewer.scale;
	$.each(this.lines, function(i, l) {
		var e = self.children[i];
		animeTo(l, "x1", (self.bounds.x + self.bounds.w/2) * scale);
		animeTo(l, "y1", (self.bounds.y + self.bounds.h  ) * scale);
		animeTo(l, "x2", (e.bounds.x + e.bounds.w/2) * scale);
		animeTo(l, "y2", (e.bounds.y) * scale);
		l.setAttribute("display", "block");
		if(this.childVisible0 != this.childVisible) {
			if(self.childVisible) {
				anime(l, "opacity", 0, 1);
			} else {
				anime(l, "opacity", 1, 0);
			}
		}
	});
	$.each(this.contextLines, function(i, l) {
		l.setAttribute("display", "block");
		var e = self.contexts[i];
		animeTo(l, "x1", (self.bounds.x + self.bounds.w  ) * scale);
		animeTo(l, "y1", (self.bounds.y + self.bounds.h/2) * scale);
		animeTo(l, "x2", (e.bounds.x) * scale);
		animeTo(l, "y2", (e.bounds.y + e.bounds.h/2) * scale);
		if(this.childVisible0 != this.childVisible) {
			if(self.childVisible) {
				anime(l, "opacity", 0, 1);
			} else {
				anime(l, "opacity", 1, 0);
			}
		}
	});
	if(this.argumentBorder != null) {
		var n = 10;
		var b = this.argumentBorder.context;
		animeTo(b, "x"     , (this.argumentBounds.x - n) * scale);
		animeTo(b, "y"     , (this.argumentBounds.y - n) * scale);
		animeTo(b, "width" , (this.argumentBounds.x1 + n*2) * scale);
		animeTo(b, "height", (this.argumentBounds.y1 + n*2) * scale);
		this.argumentBorder.attr("display", this.childVisible ? "block" : "none");
	}
	this.animCss = animCss;
	this.animSvg = animSvg;
}

View.prototype.animate = function(r) {
	var scale = this.viewer.scale;
	if(this.visible == this.visible0 && !this.visible0) return;
	function mid(x0, x1) { return (x1-x0) * r + x0; }
	this.setBounds(
			mid(this.bounds0.x, this.bounds.x), mid(this.bounds0.y, this.bounds.y),
			mid(this.bounds0.w, this.bounds.w), mid(this.bounds0.h, this.bounds.h));
	$.each(this.animCss, function(i, e) {
		e.dom.css(e.prop, e.from + (e.to - e.from) * r);
	});
	$.each(this.animSvg, function(i, e) {
		e.dom.setAttribute(e.prop, e.from + (e.to - e.from) * r);
	});
	this.forEachNode(function(e) {
		e.animate(r);
	});
}

View.prototype.move = function() {
	var scale = this.viewer.scale;
	this.setBounds(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
	this.svg.setAttribute("display", this.visible ? "block" : "none");
	this.svg.setAttribute("fill", getColorByState(this.node));
	if(this.viewer.selectedNode == this) {
		this.svg.setAttribute("stroke", "orange");
	} else {
		this.svg.setAttribute("stroke", "none");
	}
	this.div.css("display", this.visible ? "block" : "none");
	if(scale < MIN_DISP_SCALE) {
		this.divText.css("display", "none");
		this.divName.css("display", "none");
		if(this.divNodesVisible) {
			this.divNodes.html("<p></p>");
		}
	} else {
		this.divText.css("display", "block");
		this.divName.css("display", "block");
		if(this.divNodesVisible) {
			this.divNodes.html(this.divNodesText);
		}
	}

	$.each(this.animCss, function(i, e) {
		e.dom.css(e.prop, e.to);
	});
	$.each(this.animSvg, function(i, e) {
		e.dom.setAttribute(e.prop, e.to);
	});

	if(this.node.isUndevelop()) {
		this.svgUndevel.attr("display", this.visible ? "block" : "none");
	}
	this.forEachNode(function(e) {
		e.move();
	});
	this.divNodes.css("display", !this.childVisible ? "block" : "none");
	// line
	var lines = this.lines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	var lines = this.contextLines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	if(this.argumentBorder != null) {
		this.argumentBorder.attr("display", this.childVisible ? "block" : "none");
	}
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;
}

