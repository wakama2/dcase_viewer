//-------------------------------------
// const
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 100;
var SCALE_MIN = 0.1;
var SCALE_MAX = 6.0;
var SVG_NS = "http://www.w3.org/2000/svg";

//-------------------------------------
// global

var DCaseViewer = function(root, opts) {
	root.className = "viewer-root";
	this.root = root;

	this.svgroot = document.createElementNS(SVG_NS, "svg");
	this.svgroot.id = "svgroot";
	this.svgroot.style.position = "absolute";
	this.svgroot.style.left = 0;
	this.svgroot.style.top  = 0;
	this.svgroot.style.width  = "100%";
	this.svgroot.style.height = "100%";
	root.appendChild(this.svgroot);

	this.moving = false;
	this.dragX = 0;
	this.dragY = 0;
	this.scale = 1.0;
	this.drag_flag = true;

	this.selectedNode = null;
	this.rootview = this.createView(opts.node);
	this.shiftX = ($(root).width() - this.rootview.updateLocation(0, 0).x * this.scale)/2;
	this.shiftY = 20;
	this.repaintAll(0);
	this.addEventHandler();
}

DCaseViewer.prototype.createView = function(node) {
	var v = new View(this, node);
	for(var i=0; i<node.children.length; i++) {
		v.addChild(this.createView(node.children[i]));
	}
	for(var i=0; i<node.contexts.length; i++) {
		v.addChild(this.createView(node.contexts[i]));
	}
	return v;
}

DCaseViewer.prototype.createDiv = function(className) {
	var obj = document.createElement("div");
	obj.className = className;
	this.root.appendChild(obj);
	return obj;
}

DCaseViewer.prototype.createSvg = function(name) {
	var obj = document.createElementNS(SVG_NS, name);
	this.svgroot.appendChild(obj);
	return obj;
}

DCaseViewer.prototype.centerize = function(view) {
	this.selectedNode = view;
	this.rootview.updateLocation(0, 0);
	var b = view.bounds;
	this.shiftX = -b.x * this.scale + ($(this.root).width() - b.w * this.scale) / 2;
	this.shiftY = -b.y * this.scale + $(this.root).height() / 5 * this.scale;
	this.repaintAll(500);
}

DCaseViewer.prototype.repaintAll = function(ms) {
	var self = this;
	var rootview = self.rootview;
	rootview.updateLocation(
			(self.shiftX + self.dragX) / self.scale, (self.shiftY + self.dragY) / self.scale);
	if(ms == 0) {
		rootview.move();
		return;
	}
	self.moving = true;
	var begin = new Date();
	var id = setInterval(function() {
		var time = new Date() - begin;
		var r = time / ms;
		if(r < 1.0) {
			rootview.animate(r);
		} else {
			clearInterval(id);
			rootview.move();
			self.moving = false;
		}
	}, 1000/60);
}

DCaseViewer.prototype.setDragLock = function(b) {
	this.drag_flag = b;
}

DCaseViewer.prototype.getDragLock = function() {
	return this.drag_flag;
}

DCaseViewer.prototype.setSelectedNode = function(node) {
	this.selectedNode = node;
	this.repaintAll();
}

DCaseViewer.prototype.getSelectedNode = function() {
	return this.selectedNode;
}

