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
	this.opts = opts;
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
	this.addEventHandler();
	this.setTextSelectable(false);
}

function create(self, node) {
	var view = new DNodeView(self, node);
	if(node.context != null) {
		view.addChild(create(self, node.context));
	}
	for(var i=0; i<node.children.length; i++) {
		view.addChild(create(self, node.children[i]));
	}
	return view;
}

DCaseViewer.prototype.setModel = function(model) {
	$(this.svgroot).empty();
	$(this.root)
		.empty()
		.append(this.svgroot);

	var self = this;
	this.rootview = create(self, model);
	this.model = model;
	this.shiftX = ($(self.root).width() - self.rootview.updateLocation(0, 0).x * self.scale)/2;
	this.shiftY = 20;
	this.repaintAll();
}

DCaseViewer.prototype.centerize = function(view, ms) {
	this.selectedNode = view;
	this.rootview.updateLocation(0, 0);
	var b = view.bounds;
	this.shiftX = -b.x * this.scale + ($(this.root).width() - b.w * this.scale) / 2;
	this.shiftY = -b.y * this.scale + $(this.root).height() / 5 * this.scale;
	this.repaintAll(ms);
}

DCaseViewer.prototype.repaintAll = function(ms) {
	var self = this;
	var rootview = self.rootview;
	rootview.updateLocation(
			(self.shiftX + self.dragX) / self.scale, (self.shiftY + self.dragY) / self.scale);
	var a = new Animation();
	rootview.animeStart(a);
	if(ms == 0) {
		a.animeFinish();
		return;
	}
	self.moving = true;
	var begin = new Date();
	var id = setInterval(function() {
		var time = new Date() - begin;
		var r = time / ms;
		if(r < 1.0) {
			a.anime(r);
		} else {
			clearInterval(id);
			a.animeFinish();
			self.moving = false;
		}
	}, 1000/60);
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
		var b0 = view.bounds;
		view.setChildVisible(!view.childVisible);
		this.rootview.updateLocation(0, 0);
		var b1 = view.bounds;
		this.shiftX -= (b1.x-b0.x) * this.scale;
		this.shiftY -= (b1.y-b0.y) * this.scale;
		this.repaintAll(ANIME_MSEC);
	}
}

DCaseViewer.prototype.setTextSelectable = function(b) {
	var p = b ? "auto" : "none";
	$(this.root).css({
		"user-select": p,
		"-moz-user-select": p,
		"-webkit-user-select": p
	});
}

DCaseViewer.prototype.createSvg = function(name) {
	var obj = document.createElementNS(SVG_NS, name);
	this.svgroot.append(obj);
	return obj;
}

