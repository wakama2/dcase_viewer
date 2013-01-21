var FONT_SIZE = 12;
var MIN_DISP_SCALE = 4 / FONT_SIZE;

function newGSNObject(root, type) {
	var o = null;
	if(type == "Goal") {
		o = root.createSvg("rect");
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("x", x);
			this.setAttribute("y", y);
			this.setAttribute("width", w);
			this.setAttribute("height", h);
		}
		o.offset = { x: 0, y: 0 };
	} else if(type == "Context") {
		o = root.createSvg("rect");
		o.setBounds = function(x, y, w, h) {
			var n = 20 * root.scale;
			this.setAttribute("rx", n);
			this.setAttribute("ry", n);
			this.setAttribute("x", x);
			this.setAttribute("y", y);
			this.setAttribute("width", w);
			this.setAttribute("height", h);
			o.offset = { x: n/3/root.scale, y: n/3/root.scale };
		}
	} else if(type == "Strategy") {
		o = root.createSvg("polygon");
		o.setBounds = function(x, y, w, h) {
			var n = 20 * root.scale;
			this.setAttribute("points", 
					(x+n)+","+y+" "+(x+w)+","+y+" "+(x+w-n)+","+(y+h)+" "+x+","+(y+h));
			o.offset = { x: 20, y: 0 };
		}
	} else if(type == "Evidence" || type == "Monitor") {
		o = root.createSvg("ellipse");
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("cx", x + w/2);
			this.setAttribute("cy", y + h/2);
			this.setAttribute("rx", w/2);
			this.setAttribute("ry", h/2);
			o.offset = { x: w/8/root.scale, y: h/8/root.scale };
		}
		o.offset = { x: 0, y: 0 };
	} else {
		throw type + " is not GSN type";
	}
	//o.setAttribute("stroke", "black");
	o.setAttribute("fill"  , "#CCCCCC");
	return o;
}

/* class View */
var View = function(root, node) {
	// node
	this.root = root;
	this.node = node;
	this.svg = newGSNObject(root, node.type);
	this.div = root.createDiv("node-container");
	this.div.dcaseview = this;

	if(node.isUndevelop()) {
		this.svgUndevel = root.createSvg("polygon");
		this.svgUndevel.setAttribute("fill", "none");
		this.svgUndevel.setAttribute("stroke", "gray");
	}
	if(node.isArgument()) {
		this.argumentBorder = root.createDiv("div");
		this.argumentBorder.className = "argument-border";
		this.argumentBorder.style.zIndex = -99;
	}
	this.argumentBounds = {};

	this.divName = document.createElement("div");
	this.divName.className = "node-name";
	this.divName.innerHTML = node.name;
	this.div.appendChild(this.divName);

	this.divText = document.createElement("div");
	this.divText.className = "node-text";
	this.divText.innerHTML = node.text;
	this.div.appendChild(this.divText);

	this.divNodes = document.createElement("div");
	this.divNodes.className = "node-closednodes";
	this.divNodes.innerHTML = "";
	this.div.appendChild(this.divNodes);
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
	this.bounds = { x: 0, y: 0, w: 200, h: this.div.getBoundingClientRect().height + 60 };
	this.visible = true;
	this.childVisible = true;
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;
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
	var l = this.root.createSvg("line");
	l.setAttribute("stroke", "#404040");
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
	var scale = this.root.scale;
	this.svg.setBounds(x * scale, y * scale, w * scale, h * scale);
	this.div.style.left   = (x + this.svg.offset.x) * scale + "px";
	this.div.style.top    = (y + this.svg.offset.y) * scale + "px";
	this.div.style.width  = (w - this.svg.offset.x * 2) * scale + "px";
	this.div.style.height = (h - this.svg.offset.y * 2) * scale + "px";
	this.div.style.fontSize = Math.round(FONT_SIZE * scale) + "px";

	if(this.node.isUndevelop()) {
		var sx = (x + w/2) * scale;
		var sy = (y + h) * scale;
		var n = 20 * scale;
		function s(x, y) { return x+","+y }
		this.svgUndevel.setAttribute("points", 
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
			this.argumentBounds = { x:x0, y:y0, x1:x+w, y1:y+h };
			return { x: x+w, y: y+h };
		} else {
			this.argumentBounds = { x:x0, y:y0, x1:x, y1:y };
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
	this.argumentBounds = { x:x0, y:y0, x1:x, y1:y };
	return { x: x, y: y };
}

View.prototype.animate = function(r) {
	var scale = this.root.scale;
	if(this.visible == this.visible0 && !this.visible0) return;
	function mid(x0, x1) { return (x1-x0) * r + x0; }
	this.setBounds(
			mid(this.bounds0.x, this.bounds.x), mid(this.bounds0.y, this.bounds.y),
			mid(this.bounds0.w, this.bounds.w), mid(this.bounds0.h, this.bounds.h));
	if(this.visible != this.visible0) {
		if(this.visible) {
			this.svg.setAttribute("display", "block");
			this.div.style.display = "block";
		}
		this.svg.setAttribute("opacity", this.visible ? r : 1.0-r);
		this.div.style.opacity = this.visible ? r : 1.0 - r;
	}
	this.forEachNode(function(e) {
		e.animate(r);
	});
	this.divNodes.style.display = !this.childVisible ? "block" : "none";
	// line
	var lines = this.lines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.children[i];
		l.setAttribute("x1", (this.getX() + this.bounds.w/2) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h) * scale);
		l.setAttribute("x2", (e.getX() + e.bounds.w/2) * scale);
		l.setAttribute("y2", (e.getY()) * scale);
		if(this.childVisible0 != this.childVisible) {
			l.setAttribute("display", "block");
			l.setAttribute("opacity", this.childVisible ? r : 1.0 - r);
		}
	}
	var lines = this.contextLines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.contexts[i];
		l.setAttribute("x1", (this.getX() + this.bounds.w) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h/2) * scale);
		l.setAttribute("x2", (e.getX()) * scale);
		l.setAttribute("y2", (e.getY() + e.bounds.h/2) * scale);
		if(this.childVisible0 != this.childVisible) {
			l.setAttribute("display", "block");
			l.setAttribute("opacity", this.childVisible ? r : 1.0 - r);
		}
	}
	//this.argumentBorder.style.left = this.argumentBounds.x;
	//this.argumentBorder.style.top  = this.argumentBounds.y;
	//this.argumentBorder.style.right  = this.argumentBounds.x1;
	//this.argumentBorder.style.bottom = this.argumentBounds.y1;
}

function getColorByState(state) {
	if(state == "normal") {
		return "#F0F0F0";
	} else if(state == "error") {
		return "#FF8080";
	}
}

View.prototype.move = function() {
	var scale = this.root.scale;
	this.setBounds(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
	this.svg.setAttribute("display", this.visible ? "block" : "none");
	this.svg.setAttribute("fill", getColorByState(this.node.state));
	this.div.style.display = this.visible ? "block" : "none";
	if(scale < MIN_DISP_SCALE) {
		this.divText.style.display = "none";
		this.divName.style.display = "none";
		if(this.divNodesVisible) {
			this.divNodes.innerHTML = "<p></p>";
		}
	} else {
		this.divText.style.display = "block";
		this.divName.style.display = "block";
		if(this.divNodesVisible) {
			this.divNodes.innerHTML = this.divNodesText;
		}
	}
	if(this.node.isUndevelop()) {
		this.svgUndevel.setAttribute("display", this.visible ? "block" : "none");
	}
	this.forEachNode(function(e) {
		e.move();
	});
	this.divNodes.style.display = !this.childVisible ? "block" : "none";
	// line
	var lines = this.lines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.children[i];
		l.setAttribute("x1", (this.getX() + this.bounds.w/2) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h) * scale);
		l.setAttribute("x2", (e.getX() + e.bounds.w/2) * scale);
		l.setAttribute("y2", (e.getY()) * scale);
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	var lines = this.contextLines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.contexts[i];
		l.setAttribute("x1", (this.getX() + this.bounds.w) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h/2) * scale);
		l.setAttribute("x2", (e.getX()) * scale);
		l.setAttribute("y2", (e.getY() + e.bounds.h/2) * scale);
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	if(this.node.isArgument()) {
		var n = 10;
		this.argumentBorder.style.left = scale * (this.argumentBounds.x-n) + "px";
		this.argumentBorder.style.top  = scale * (this.argumentBounds.y-n) + "px";
		this.argumentBorder.style.width  = scale * (this.argumentBounds.x1-this.argumentBounds.x+n*2) + "px";
		this.argumentBorder.style.height = scale * (this.argumentBounds.y1-this.argumentBounds.y+n*2) + "px";
		this.argumentBorder.style.display = this.childVisible ? "block" : "none";
	}
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;
}

