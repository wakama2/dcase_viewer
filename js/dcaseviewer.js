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

var DCaseViewer = function(root, model, opts) {
	root.className = "viewer-root";
	this.svgroot = $(document.createElementNS(SVG_NS, "svg")).css({
		position: "absolute", left: 0, top: 0, width: "100%", height: "100%"
	});
	this.root = root;
	this.moving = false;
	this.shiftX = 0;
	this.shiftY = 0;
	this.dragX = 0;
	this.dragY = 0;
	this.scale = 1.0;
	this.drag_flag = true;
	this.selectedNode = null;
	this.rootview = null;
	this.model = model;
	this.setModel(model);
}

DCaseViewer.prototype.setModel = function(model) {
	$(this.svgroot).empty();
	$(this.root)
		.empty()
		.append(this.svgroot);

	var self = this;
	function create(node) {
		var view = new View(self, node);
		for(var i=0; i<node.children.length; i++) {
			view.addChild(create(node.children[i]));
		}
		for(var i=0; i<node.contexts.length; i++) {
			view.addChild(create(node.contexts[i]));
		}
		return view;
	}
	this.rootview = create(model);
	this.shiftX = ($(this.root).width() - this.rootview.updateLocation(0, 0).x * this.scale)/2;
	this.shiftY = 20;
	this.model = model;
	this.repaintAll(0);
	this.addEventHandler();
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

DCaseViewer.prototype.actExpandBranch = function(view, b) {
	if(b == undefined || b != view.childVisible) {
		this.rootview.updateLocation(0, 0);
		var x0 = view.bounds.x;
		view.setChildVisible(!view.childVisible);
		this.rootview.updateLocation(0, 0);
		var x1 = view.bounds.x;
		this.shiftX -= (x1-x0) * this.scale;
		this.repaintAll(ANIME_MSEC);
	}
}

// duplicated
DCaseViewer.prototype.createDiv = function(className) {
	var obj = document.createElement("div");
	obj.className = className;
	this.root.appendChild(obj);
	return obj;
}

DCaseViewer.prototype.createSvg = function(name) {
	var obj = document.createElementNS(SVG_NS, name);
	this.svgroot.append(obj);
	return obj;
}

