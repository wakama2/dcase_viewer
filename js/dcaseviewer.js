//-------------------------------------
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 100;
var SCALE_MIN = 0.1;
var SCALE_MAX = 6.0;
var SVG_NS = "http://www.w3.org/2000/svg";

//-------------------------------------

var DCaseViewer = function(root, arg) {

	this.$root = $(root);
	root.className = "viewer-root";

	var $svgroot = $(document.createElementNS(SVG_NS, "svg")).css({
		position: "absolute", left: 0, top: 0, width: "100%", height: "100%"
	}).appendTo(this.$root);
	this.$svg = $(document.createElementNS(SVG_NS, "g"))
		.appendTo($svgroot);
	this.$dom = $("<div></div>").css({
		position: "absolute", left: 0, top: 0, width: "100%", height: "100%"
	}).appendTo(this.$root);
	//------------------------------------

	this.argument = null;
	this.moving = false;
	this.shiftX = 0;
	this.shiftY = 0;
	this.dragX = 0;
	this.dragY = 0;
	this.scale = 1.0;
	this.drag_flag = true;
	this.selectedNode = null;
	this.rootview = null;

	//------------------------------------

	this.setArgument(arg);
	this.addEventHandler();
	this.setTextSelectable(false);
}

DCaseViewer.prototype.getArgument = function() {
	return this.argument;
};

DCaseViewer.prototype.setArgument = function(arg) {
	var self = this;
	this.argument = arg;

	this.$svg.empty();
	this.$dom.empty();
	this.showToolbox(null);

	if(arg == null) {
		//TODO show new_argument button
		return;
	}

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
	this.rootview = create(arg.getTopGoal());

	setTimeout(function() {
		function f(v) {//FIXME
			var b = v.svg.outer(200, v.divText.height() / self.scale + 60);
			v.bounds.w = b.w;
			v.bounds.h = b.h;
			v.forEachNode(function(e) {
				f(e);
			});
		}
		f(self.rootview);
		self.rootview.updateLocation(0, 0);
		self.shiftX = (self.$root.width() - self.treeSize().w * self.scale)/2;
		self.shiftY = 20;
		self.repaintAll();
	}, 100);
}

DCaseViewer.prototype.structureUpdated = function(ms) {
	this.setArgument(this.argument);//TODO animation
};

DCaseViewer.prototype.centerize = function(view, ms) {
	if(this.rootview == null) return;
	this.selectedNode = view;
	this.rootview.updateLocation(0, 0);
	var b = view.bounds;
	this.shiftX = -b.x * this.scale + (this.$root.width() - b.w * this.scale) / 2;
	this.shiftY = -b.y * this.scale + this.$root.height() / 5 * this.scale;
	this.repaintAll(ms);
}

DCaseViewer.prototype.repaintAll = function(ms) {
	if(this.rootview == null) return;
	var self = this;

	var dx = Math.floor(self.shiftX + self.dragX);
	var dy = Math.floor(self.shiftY + self.dragY);

	var a = new Animation();
	self.rootview.updateLocation(dx / self.scale, dy / self.scale);
	self.rootview.animeStart(a);
	if(ms == 0 || ms == null) {
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

DCaseViewer.prototype.showToolbox = function(node) {
	var self = this;
	if(this.toolboxNode != node) {
		if(node != null) {
			var data = node.node;
			var b = node.div.offset();
			var w = node.div.width();
			var x = 120;

			$("#toolbar").css({
				display: "block",
				left: b.left + (w - x)/2,
				top: b.top - 40,
				width: x,
				height: 30,
			});

			var hasChild = data.getNodeCount() != 0;
			var visibleChild = node.childVisible;
			$("#toolbar .tool-play").css("display", data.isDScript ? "inline" : "none");
			$("#toolbar .tool-up")  .css("display", hasChild && visibleChild ? "inline" : "none");
			$("#toolbar .tool-down").css("display", hasChild && !visibleChild ? "inline" : "none");
		} else {
			$("#toolbar").css("display", "none");
		}
		this.toolboxNode = node;
	}
}

DCaseViewer.prototype.treeSize = function() {
	return this.rootview.getTreeBounds();
}

DCaseViewer.prototype.setSelectedNode = function(node) {
	this.selectedNode = node;
	this.repaintAll();
	this.showToolbox(node);
}

DCaseViewer.prototype.getSelectedNode = function() {
	return this.selectedNode;
}

DCaseViewer.prototype.expandBranch = function(view, b) {
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
	this.$root.css({
		"user-select": p,
		"-moz-user-select": p,
		"-webkit-user-select": p
	});
}

DCaseViewer.prototype.fit = function(ms) {
	if(this.rootview == null) return;
	var size = this.rootview.treeSize();
	this.scale = Math.min(
		this.root.width()  * 0.98 / size.x,
		this.root.height() * 0.98 / size.y);
	var b = this.rootview.bounds;
	this.shiftX = -b.x * this.scale + (this.$root.width() - b.w * this.scale) / 2;
	this.shiftY = -b.y * this.scale + (this.$root.height() - size.y * this.scale) / 2;
	this.repaintAll(ms);
}

DCaseViewer.prototype.createSvg = function(name) {
	var obj = document.createElementNS(SVG_NS, name);
	this.$svg.append(obj);
	return obj;
}

DCaseViewer.prototype.showDScriptExecuteWindow = function(scriptName) {
	var self = this;
	self.showToolbox(null);
	var r = DCaseAPI.call("search", { filter: ["Context"] });
	var nn = null;
	for(var i=0; i<r[0].length; i++) {
		if(r[0][i].value === scriptName) {
			var n = DCaseAPI.get([], r[0][i].argument_id);
			nn = createNodeFromJson(n);
			break;
		}
	}
	if(nn.context != null) {
		nn.context.type = "Subject";
	}
	var t = $("<div></div>")
			.addClass("dscript-exe-window")
			.appendTo(self.$root);

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

