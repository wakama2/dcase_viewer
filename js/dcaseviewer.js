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
	this.editInPlaceOpts = {
		callback: function(_, txt) { return txt; },
		field_type: "textarea",
		textarea_rows: 3,
		textarea_cols: 20,
		show_buttons: true
	};
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

DCaseViewer.prototype.setModel = function(model) {
	$(this.svgroot).empty();
	$(this.root)
		.empty()
		.append(this.svgroot);

	var self = this;
	function create(node) {
		var view = new DNodeView(self, node);
		if(node.context != null) {
			view.addChild(create(node.context));
		}
		for(var i=0; i<node.children.length; i++) {
			view.addChild(create(node.children[i]));
		}
		return view;
	}
	this.rootview = create(model);
	this.shiftX = ($(this.root).width() - this.rootview.updateLocation(0, 0).x * this.scale)/2;
	this.shiftY = 20;
	this.model = model;
	this.repaintAll(0);
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
	rootview.animeBegin(a);
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

DCaseViewer.prototype.prevVersion = function(v) {
	var node = v.node;
	var prev = node.prevVersion;
	if(prev != null) {
		var parent = node.parents[0];
		for(var i=0; i<parent.children.length; i++) {
			if(parent.children[i] == node) {
				parent.children[i] = prev;
				if(prev.parents.length == 0) {
					prev.parents.push(parent);
				}
				console.log("node " + i);
				this.setModel(this.model);
				break;
			}
		}
	}
}

DCaseViewer.prototype.nextVersion = function(v) {
	var node = v.node;
	var next = node.nextVersion;
	if(next != null) {
		var parent = node.parents[0];
		for(var i=0; i<parent.children.length; i++) {
			if(parent.children[i] == node) {
				parent.children[i] = next;
				if(next.parents.length == 0) {
					next.parents.push(parent);
				}
				console.log("node " + i);
				this.setModel(this.model);
				break;
			}
		}
	}
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

DCaseViewer.prototype.fit = function(ms) {
	var size = this.rootview.updateLocation(0, 0);
	this.scale = Math.min(
		$(this.root).width()  * 0.98 / size.x,
		$(this.root).height() * 0.98 / size.y);
	var b = this.rootview.bounds;
	this.shiftX = -b.x * this.scale + ($(this.root).width() - b.w * this.scale) / 2;
	this.shiftY = -b.y * this.scale + ($(this.root).height() - size.y * this.scale) / 2;
	this.repaintAll(ms);
}

DCaseViewer.prototype.traverseAll = function(f) {
	function traverse(node) {
		f(node);
		if(node.context != null) f(node.context);
		for(var i=0; i<node.children.length; i++) {
			traverse(node.children[i]);
		}
	}
	traverse(this.model);
}

DCaseViewer.prototype.appendElem = function(e) {
	$(this.root).append(e);
}

DCaseViewer.prototype.appendSvg = function(e) {
	$(this.svgroot).append(e);
}

DCaseViewer.prototype.createSvg = function(name) {
	var obj = document.createElementNS(SVG_NS, name);
	this.svgroot.append(obj);
	return obj;
}

DCaseViewer.prototype.showDScriptExecuteWindow = function(scriptName) {
	var self = this;
	var r = DCaseAPI.call("search", { filter: ["Context"] });
	var nn = null;
	for(var i=0; i<r[0].length; i++) {
		if(r[0][i].value === scriptName) {
			var n = DCaseAPI.get([], r[0][i].argument_id);
			nn = createNodeFromJson(n);
			break;
		}
	}
	var t = $("<div></div>").addClass("dscript-exe-window");
	self.appendElem(t);

	var r1x = document.createElement("div");
	var t1 = $(r1x).css({
		position: "absolute",
		left: "20px", top: "20px", right: "20px", bottom: "60px",
	}).attr("id", "subviewer");
	t.append(t1);
	var v = new DCaseViewer(r1x, nn, {
		argument_id: self.opts.id
	});
	t.append($("<input></input>").attr({
		type: "button", value: "実行"
	}).click(function() {
		var r = DCaseAPI.call("run", {});
		alert(r);
	}));
	t.append($("<input></input>").attr({
		type: "button", value: "キャンセル"
	}).click(function() {
		t.remove();
	}));
}

