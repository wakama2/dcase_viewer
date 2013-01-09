function newSvg(name) {
	var root = document.getElementById("svgroot");
	var obj = document.createElementNS("http://www.w3.org/2000/svg", name);
	root.appendChild(obj);
	return obj;
}

function newDiv(className) {
	var root = document.getElementById("divroot");
	var obj = document.createElement("div");
	obj.className = className;
	root.appendChild(obj);
	return obj;
}

function newGSNObject(type) {
	var o = null;
	if(type == "goal") {
		o = newSvg("rect");
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("x", x);
			this.setAttribute("y", y);
			this.setAttribute("width", w);
			this.setAttribute("height", h);
		}
		o.offset = { x: 0, y: 0 };
	} else if(type == "context") {
		o = newSvg("rect");
		var n = 20;
		o.setAttribute("rx", n);
		o.setAttribute("ry", n);
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("x", x);
			this.setAttribute("y", y);
			this.setAttribute("width", w);
			this.setAttribute("height", h);
		}
		o.offset = { x: n/3, y: n/3 };
	//} else if(type == "undevelop") {
	//	o = newSvg("rect");
	} else if(type == "strategy") {
		o = newSvg("polygon");
		var n = 20;
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("points", 
					(x+n)+","+y+" "+(x+w)+","+y+" "+(x+w-n)+","+(y+h)+" "+x+","+(y+h));
		}
		o.offset = { x: n, y: 0 };
	} else if(type == "evidence" || type == "monitor") {
		o = newSvg("ellipse");
		o.setBounds = function(x, y, w, h) {
			this.setAttribute("cx", x + w/2);
			this.setAttribute("cy", y + h/2);
			this.setAttribute("rx", w/2);
			this.setAttribute("ry", h/2);
			o.offset = { x: w/8, y: h/8 };
		}
		o.offset = { x: 0, y: 0 };
	} else {
		throw type + " is not GSN type";
	}
	o.setAttribute("stroke", "black");
	o.setAttribute("fill"  , "#F0F0F0");
	return o;
}

/* class View */
var View = function(node) {
	// node
	this.node = node;
	this.svg = newGSNObject(node.type);
	this.divText = newDiv("node-container");
	this.divText.innerHTML =
			"<a class=\"node-name\">" + node.name + "</a><br/>" +
			"<a class=\"node-text\">" + node.text + "</a>";
	this.location = { x: 0, y: 0 };
	// line
	this.lines = [];
	this.contextLines = [];
	// for animation
	this.bounds = { x: 0, y: 0, w: 200, h: 120 };
	this.visible = true;
	this.childVisible = true;
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;

	var self = this;
	this.divText.onmouseup = function(e) { self.elementMouseUp(e); }
	this.divText.ontouchend = function(e) { self.elementTouchEnd(e); }
	this.setBounds(0, 0, 200, 120);
}

View.prototype.repaintAll = function(ms) {
	throw "View.repaintAll not overrided";
}

View.prototype.getX = function() { return this.location.x; }
View.prototype.getY = function() { return this.location.y; }

View.prototype.setChildVisible = function(b) {
	this.childVisible = b;
	var contexts = this.node.contexts;
	for(var i=0; i<contexts.length; i++) {
		contexts[i].view.setVisible(b);
	}
	var children = this.node.children;
	for(var i=0; i<children.length; i++) {
		children[i].view.setVisible(b);
	}
}

View.prototype.setVisible = function(b) {
	this.visible = b;
	this.childVisible = b;
	var contexts = this.node.contexts;
	for(var i=0; i<contexts.length; i++) {
		contexts[i].view.setVisible(b);
	}
	var children = this.node.children;
	for(var i=0; i<children.length; i++) {
		children[i].view.setVisible(b);
	}
}

View.prototype.addChild = function(node) {
	var l = newSvg("line");
	l.setAttribute("stroke", "#404040");
	if(node.type != "context") {
		this.lines.push(l);
	} else {
		this.contextLines.push(l);
	}
}

View.prototype.setBounds = function(x, y, w, h) {
	this.location = { x: x, y: y };
	this.svg.setBounds(x * scale, y * scale, w * scale, h * scale);
	this.divText.style.left   = (x + this.svg.offset.x) * scale + "px";
	this.divText.style.top    = (y + this.svg.offset.y) * scale + "px";
	this.divText.style.width  = (w - this.svg.offset.x * 2) * scale + "px";
	this.divText.style.height = (h - this.svg.offset.y * 2) * scale + "px";
	this.divText.style.fontSize = (12 * scale) + "px";
}

View.prototype.updateLocation = function(x, y) {
	var x0 = x;
	var y0 = y;
	var w = this.bounds.w;
	var h = this.bounds.h;
	if(!this.visible || !this.childVisible) {
		var contexts = this.node.contexts;
		for(var i=0; i<contexts.length; i++) {
			contexts[i].view.updateLocation(x, y);
		}
		var children = this.node.children;
		for(var i=0; i<children.length; i++) {
			children[i].view.updateLocation(x, y);
		}
		this.bounds = { 
			x: x, y: y, w: this.bounds.w, h: this.bounds.h
		};
		if(this.visible) {
			return { x: x+w, y: y+h };
		}
		return { x: x, y: y };
	}
	// contents
	if(this.node.contexts.length != 0) {
		var contexts = this.node.contexts;
		for(var i=0; i<contexts.length; i++) {
			var e = contexts[i].view;
			y = e.updateLocation(x, y).y + X_MARGIN;
		}
		y -= X_MARGIN;
	}
	y = Math.max(y0 + h, y);

	// children
	if(this.node.children.length != 0) {
		var children = this.node.children;
		for(var i=0; i<children.length; i++) {
			var e = children[i].view;
			x = e.updateLocation(x, y + Y_MARGIN).x + X_MARGIN;
		}
		x -= X_MARGIN;
	}
	x = Math.max(x0 + w, x);
	var x1 = x;
	var y1 = y;

	// set this bounds
	this.bounds = { x: x0 + (x-x0-w)/2, y: y0, w: w, h: h };

	// contents (second)
	x = this.bounds.x + w + Y_MARGIN;
	y = y0;
	var contexts = this.node.contexts;
	for(var i=0; i<contexts.length; i++) {
		var e = contexts[i].view;
		var p = e.updateLocation(x, y);
		x1 = Math.max(x1, p.x);
		y = p.y + X_MARGIN;
	}
	
	x = Math.max(x1, this.bounds.x + w);
	y = Math.max(y1, this.bounds.y + h);
	return { x: x, y: y };
}

View.prototype.animateSec = function(sec) {
	if(sec == 0) {
		this.move();
		return;
	}
	var self = this;
	var begin = new Date();
	var id = setInterval(function() {
		var time = new Date() - begin;
		var r = time / sec;
		if(r < 1.0) {
			self.animate(r);
		} else {
			clearInterval(id);
			self.move();
		}
	}, 1000/60);
}

View.prototype.animate = function(r) {
	function mid(x0, x1) { return (x1-x0) * r + x0; }
	this.setBounds(
			mid(this.bounds0.x, this.bounds.x), mid(this.bounds0.y, this.bounds.y),
			mid(this.bounds0.w, this.bounds.w), mid(this.bounds0.h, this.bounds.h));
	if(this.visible != this.visible0) {
		if(this.visible) {
			this.svg.setAttribute("display", "block");
			this.divText.style.display = "block";
		}
		this.svg.setAttribute("opacity", this.visible ? r : 1.0-r);
		this.divText.style.opacity = this.visible ? r : 1.0 - r;
	}

	var contexts = this.node.contexts;
	for(var i=0; i<contexts.length; i++) {
		var e = contexts[i].view;
		e.animate(r);
	}
	var children = this.node.children;
	for(var i=0; i<children.length; i++) {
		var e = children[i].view;
		e.animate(r);
	}
	// line
	var lines = this.lines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.node.children[i].view;
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
		var e = this.node.contexts[i].view;
		l.setAttribute("x1", (this.getX() + this.bounds.w) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h/2) * scale);
		l.setAttribute("x2", (e.getX()) * scale);
		l.setAttribute("y2", (e.getY() + e.bounds.h/2) * scale);
		if(this.childVisible0 != this.childVisible) {
			l.setAttribute("display", "block");
			l.setAttribute("opacity", this.childVisible ? r : 1.0 - r);
		}
	}
}

View.prototype.move = function() {
	this.setBounds(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
	this.svg.setAttribute("display", this.visible ? "block" : "none");
	this.divText.style.display = this.visible ? "block" : "none";
	var contexts = this.node.contexts;
	for(var i=0; i<contexts.length; i++) {
		var e = contexts[i].view;
		e.move();
	}
	var children = this.node.children;
	for(var i=0; i<children.length; i++) {
		var e = children[i].view;
		e.move();
	}
	// line
	var lines = this.lines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.node.children[i].view;
		l.setAttribute("x1", (this.getX() + this.bounds.w/2) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h) * scale);
		l.setAttribute("x2", (e.getX() + e.bounds.w/2) * scale);
		l.setAttribute("y2", (e.getY()) * scale);
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	var lines = this.contextLines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.node.contexts[i].view;
		l.setAttribute("x1", (this.getX() + this.bounds.w) * scale);
		l.setAttribute("y1", (this.getY() + this.bounds.h/2) * scale);
		l.setAttribute("x2", (e.getX()) * scale);
		l.setAttribute("y2", (e.getY() + e.bounds.h/2) * scale);
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;
}

