var X_MARGIN = 10;
var Y_MARGIN = 40;

function newSvg(name) {
	var root = document.getElementById("svgroot");
	var obj = document.createElementNS("http://www.w3.org/2000/svg", name);
	root.appendChild(obj);
	return obj;
}
	
/* class View */
var View = function(node) {

	function newDiv(className) {
		var root = document.getElementById("divroot");
		var obj = document.createElement("div");
		obj.className = className;
		root.appendChild(obj);
		return obj;
	}

	this.node = node;
	this.svg = newSvg("rect");
	this.svg.setAttribute("stroke", "black");
	this.svg.setAttribute("fill"  , "white");
	this.divName = newDiv("node-name");
	this.divName.innerHTML = node.name;
	this.divText = newDiv("node-text");
	this.divText.innerHTML = node.text;

	this.bounds = { x: 0, y: 0, w: 200, h: 120 };
	this.visible = true;
	this.childVisible = true;

	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;

	this.lines = [];
	this.contextLines = [];

	this.setLocation(0, 0);
	this.setSize(200, 120);

	var self = this;
	this.divText.onclick = function(e) {
		self.setChildVisible(!self.childVisible);
		self.repaintAll();
	}
}

View.prototype.repaintAll = function() {
	alert("View.repaintAll not overrided");
}

View.prototype.getX = function() { return parseInt(this.svg.getAttribute("x")); }
View.prototype.getY = function() { return parseInt(this.svg.getAttribute("y")); }

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

View.prototype.setLocation = function(x, y) {
	this.svg.setAttribute("x", x);
	this.svg.setAttribute("y", y);
	this.divName.style.left = x + "px";
	this.divName.style.top  = y + "px";
	var n = 20;
	this.divText.style.left = x + "px";
	this.divText.style.top  = (y+n) + "px";
}

View.prototype.setSize = function(w, h) {
	var n = 20;
	this.svg.setAttribute("width" , w);
	this.svg.setAttribute("height", h);
	this.divName.style.width  = w + "px";
	this.divName.style.height = h + "px";
	this.divName.width = w;
	this.divName.height = h;
	this.divText.style.width  = w + "px";
	this.divText.style.height = (h-n) + "px";
	this.divText.width = w;
	this.divText.height = (h-n);
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
	this.bounds = { 
		x: x0 + (x-x0-w)/2,
		y: y0,
		w: w,
		h: h
	};

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
	var x = mid(this.bounds0.x, this.bounds.x);
	var y = mid(this.bounds0.y, this.bounds.y);
	this.setLocation(x, y);

	if(this.visible != this.visible0) {
		if(this.visible) {
			this.svg.setAttribute("display", "block");
			this.divName.style.display = "block";
			this.divText.style.display = "block";
		}
		this.svg.setAttribute("opacity", this.visible ? r : 1.0-r);
		this.divName.style.opacity = this.visible ? r : 1.0 - r;
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
		l.setAttribute("x1", this.getX() + this.bounds.w/2);
		l.setAttribute("y1", this.getY() + this.bounds.h);
		l.setAttribute("x2", e.getX() + e.bounds.w/2);
		l.setAttribute("y2", e.getY());
		l.setAttribute("display", this.childVisible ? "block" : "none");
		l.setAttribute("opacity", this.childVisible ? r : 1.0 - r);
	}
	var lines = this.contextLines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.node.contexts[i].view;
		l.setAttribute("x1", this.getX() + this.bounds.w);
		l.setAttribute("y1", this.getY() + this.bounds.h/2);
		l.setAttribute("x2", e.getX());
		l.setAttribute("y2", e.getY() + e.bounds.h/2);
		l.setAttribute("display", this.childVisible ? "block" : "none");
		l.setAttribute("opacity", this.childVisible ? r : 1.0 - r);
	}
}

View.prototype.move = function() {
	this.setLocation(this.bounds.x, this.bounds.y);
	this.svg.setAttribute("display", this.visible ? "block" : "none");
	this.divName.style.display = this.visible ? "block" : "none";
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
		l.setAttribute("x1", this.getX() + this.bounds.w/2);
		l.setAttribute("y1", this.getY() + this.bounds.h);
		l.setAttribute("x2", e.getX() + e.bounds.w/2);
		l.setAttribute("y2", e.getY());
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	var lines = this.contextLines;
	for(var i=0; i<lines.length; i++) {
		var l = lines[i];
		var e = this.node.contexts[i].view;
		l.setAttribute("x1", this.getX() + this.bounds.w);
		l.setAttribute("y1", this.getY() + this.bounds.h/2);
		l.setAttribute("x2", e.getX());
		l.setAttribute("y2", e.getY() + e.bounds.h/2);
		l.setAttribute("display", this.childVisible ? "block" : "none");
	}
	this.bounds0 = this.bounds;
	this.visible0 = this.visible;
	this.childVisible0 = this.childVisible;
}

