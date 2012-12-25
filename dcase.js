var NODE_W = 140;
var NODE_H = 80;
var X_MARGIN = 4;
var Y_MARGIN = 40;
var ANIME_MSEC = 250;

var Point = function(x0, y0, x1, y1) {
	this.x0 = x0;
	this.y0 = y0;
	this.x1 = x1;
	this.y1 = y1;

	var self = this;
	this.x = function(r) { return (self.x1-self.x0)  * r + self.x0; }
	this.y = function(r) { return (self.y1-self.y0)  * r + self.y0; }
}

var rootCanvas = null;
var bg_touch = false;
var bg_scale = 1.0;

/* class Node */
var Node = function(name, type) {
	var self = this;
	/* model */
	this.name = name;
	this.text = "no description";
	this.type = type;
	this.nodes = [];

	/* view */
	var cv = document.createElement("canvas");
	this.cv = cv;
	this.nodesCv = [];
	this.visible = true;
	this.visible1 = true;

	this.width  = NODE_W;
	this.height = NODE_H;
	cv.style.position = "absolute";
	cv.style.left = 0;
	cv.style.top  = 0;
	cv.style.width  = self.width;
	cv.style.height = self.height;
	cv.width  = self.width;
	cv.height = self.height;
	cv.onclick = function(e) {
		if(bg_touch) return;
		if(self.nodes.length != 0) {
			bg_touch = true;
			self.setChildExpand(!self.nodes[0].visible);
		}
	}
	cv.ontouchstart = cv.onclick;
	rootCanvas.appendChild(cv);

	this.setChildExpand = function(b) {
		for(var i=0; i<self.nodes.length; i++) {
			self.nodes[i].setVisible(!self.nodes[i].visible);
		}
		self.paint();
		self.calcLocationAll();
	}

	this.setVisible = function(b) {
		self.visible1 = b;
		if(!b/* || self.nodes.length <= 1*/) {
			for(var i=0; i<self.nodes.length; i++) {
				self.nodes[i].setVisible(b);
			}
		}
		self.paint();
	}

	this.addNode = function(node) {
		self.nodes.push(node);
		node.parent = self;

		var cv = document.createElement("canvas");
		cv.style.position = "absolute";
		rootCanvas.appendChild(cv);
		self.nodesCv.push(cv);
		return node;
	}

	this.getX = function() { return parseInt(self.cv.style.left); }
	this.getY = function() { return parseInt(self.cv.style.top);  }

	this.moveInterval = function(r) {
		self.cv.style.left = self.anime.x(r);
		self.cv.style.top  = self.anime.y(r);
		if(self.visible != self.visible1) {
			if(self.visible1) {
				self.cv.style.display = "block";
				self.cv.style.opacity = r;
			} else {
				self.cv.style.opacity = 1.0 - r;
			}
		}
		for(var i=0; i<self.nodes.length; i++) {
			self.nodes[i].moveInterval(r);
		}
	}

	this.moveEnd = function() {
		self.cv.style.left = self.anime.x1;
		self.cv.style.top  = self.anime.y1;
		if(self.visible != self.visible1) {
			self.cv.style.display = self.visible1 ? "block" : "none";
			self.cv.style.opacity = 1.0;
			self.visible = self.visible1;
		}
		for(var i=0; i<self.nodes.length; i++) {
			self.nodes[i].moveEnd();
		}
	}

	this.calcLocation = function(x, y) {
		var x1 = x;
		var nodeCnt = 0;
		var contexts = [];
		for(var i=0; i<self.nodes.length; i++) {
			var node = self.nodes[i];
			if(node.visible1) {
				if(node.type == "context") {
					contexts.push(node);
				} else {
					x1 = node.calcLocation(x1, y + self.height + Y_MARGIN);
					x1 += X_MARGIN;
					nodeCnt++;
				}
			} else {
				node.calcLocation(x, y);
			}
		}
		if(nodeCnt == 0) {
			self.anime = new Point(self.getX(), self.getY(), x, y);
			x1 = x + self.width;
		} else {
			x1 -= X_MARGIN;
			x = (x+x1-self.width)/2;
			self.anime = new Point(self.getX(), self.getY(), x, y);
		}
		for(var i=0; i<contexts.length; i++) {
			var node = contexts[i];
			var x2 = node.calcLocation(x + self.width + Y_MARGIN, y);
			y += self.height + X_MARGIN;
			x1 = Math.max(x1, x2);
		}
		return x1;
	}

	this.paint = function() {
		var ctx = self.cv.getContext("2d");
		ctx.clearRect(0, 0, self.width, self.height);
		ctx.beginPath();
		if(self.type == "goal") {
			ctx.rect(0, 0, self.width, self.height);
		} else if(self.type == "strategy") {
			var n = 16;
			ctx.moveTo(n, 0);
			ctx.lineTo(0, self.height);
			ctx.lineTo(self.width-n, self.height);
			ctx.lineTo(self.width, 0);
		} else if(self.type == "evidence" || self.type == "monitor") {
			// by http://spphire9.wordpress.com/2010/03/08/
			ctx.ellipse = function(left, top, right, bottom) {
			  var halfWidth = (right - left) / 2.0;
			  var halfHeight = (bottom - top) / 2.0;
			  var x0 = left + halfWidth;
			  var y1 = top + halfHeight;
			  //this.beginPath();
			  var cw = 4.0 * (Math.sqrt(2.0) - 1.0) * halfWidth / 3.0;
			  var ch = 4.0 * (Math.sqrt(2.0) - 1.0) * halfHeight / 3.0;
			  this.moveTo(x0, top);
			  this.bezierCurveTo(x0 + cw, top, right, y1 - ch, right, y1);
			  this.bezierCurveTo(right, y1 + ch, x0 + cw, bottom, x0, bottom);
			  this.bezierCurveTo(x0 - cw, bottom, left, y1 + ch, left, y1);
			  this.bezierCurveTo(left, y1 - ch, x0 - cw, top, x0, top);
			  //this.stroke();
			};
			ctx.ellipse(0, 0, self.width, self.height);
		} else if(self.type == "context") {
			var n = 16;
			ctx.moveTo(n, 0);
			ctx.lineTo(self.width-n, 0);
			ctx.quadraticCurveTo(self.width, 0, self.width, n);
			ctx.lineTo(self.width, self.height-n);
			ctx.quadraticCurveTo(self.width, self.height, self.width-n, self.height);
			ctx.lineTo(n, self.height);
			ctx.quadraticCurveTo(0, self.height, 0, self.height-n);
			ctx.lineTo(0, n);
			ctx.quadraticCurveTo(0, 0, n, 0);
		} else if(self.type == "undevelop") {
			var hw = self.width/2;
			var hh = self.height/2;
			ctx.moveTo(hw, 0);
			ctx.lineTo(self.width, hh);
			ctx.lineTo(hw, self.height);
			ctx.lineTo(0, hh);
		}
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#F0F0F0";
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.font = "32px";
		ctx.strokeStyle = "#000000";
		ctx.strokeText(self.name, 4, 16);
		ctx.fillStyle = "#606060";
		ctx.fillText(self.text, 4, 32);
		if(self.nodes.length != 0 && !self.nodes[0].visible1) {
			var text = self.nodes.length + " nodes..";
			var n = 4;
			ctx.globalAlpha = 0.8;
			ctx.fillStyle = "#FF8080";
			ctx.fillRect(n, self.height-20, self.width-8, 20-n);
			ctx.strokeStyle = "#000000";
			ctx.strokeText(text, n*2, self.height-n*2);
			ctx.globalAlpha = 1.0;
		}
	}

	this.setEdgeCanvas = function(node, cv, x0, y0, x1, y1) {
		var w = Math.max(1, Math.abs(x0-x1));
		var h = Math.max(1, Math.abs(y0-y1));
		var x = Math.min(x0, x1);
		var y = Math.min(y0, y1);
		cv.style.left = x;
		cv.style.top  = y;
		cv.style.width  = w;
		cv.style.height = h;
		cv.width  = w;
		cv.height = h;
		cv.opacity = node.cv.opacity;
		var ctx = cv.getContext("2d");
		ctx.beginPath();
		ctx.strokeStyle = "#404040";
		ctx.clearRect(0, 0, w, h);
		ctx.moveTo(x0-x, y0-y);
		ctx.lineTo(x1-x, y1-y);
		ctx.stroke();
	}

	this.paintLine = function() {
		var x0 = self.getX();
		var y0 = self.getY();
		for(var i=0; i<self.nodes.length; i++) {
			var node = self.nodes[i];
			if(node.visible) {
				var cv = self.nodesCv[i];
				var x1 = node.getX();
				var y1 = node.getY();
				if(node.type == "context" && x1 > x0 + self.width) {
					cv.style.display = "block";
					self.setEdgeCanvas(node, cv,
							x0 + self.width, y0 + self.height/2, node.getX(), y1 + self.height/2);
				} else if(y1 > y0 + self.height) {
					cv.style.display = "block";
					self.setEdgeCanvas(node, cv,
							x0 + self.width/2, y0 + self.height, node.getX() + self.width/2, y1);
				} else {
					cv.style.display = "none";
				}
				node.paintLine();
			}
		}
	}

	this.calcLocationAll = function() {
		self.parent.calcLocationAll();
	}

	self.paint();
}

function createNode() {
	var topNode = new Node("TopGoal", "goal");
	topNode.addNode(new Node("strategy", "strategy"));
	topNode.addNode(new Node("context1", "context"));
	topNode.addNode(new Node("context2", "context"));
	topNode.nodes[0].addNode(new Node("subgoal 1", "goal"));
	topNode.nodes[0].addNode(new Node("subgoal 2", "goal"));
	topNode.nodes[0].addNode(new Node("subgoal 3", "goal"));
	topNode.nodes[0].addNode(new Node("subgoal 4", "goal"));
	topNode.nodes[0].nodes[0].addNode(new Node("evidence 1", "evidence"));
	topNode.nodes[0].nodes[0].addNode(new Node("context 1.1", "context"));
	topNode.nodes[0].nodes[1].addNode(new Node("evidence 1", "evidence"));
	topNode.nodes[0].nodes[1].addNode(new Node("evidence 2", "evidence"));
	topNode.nodes[0].nodes[2].addNode(new Node("nodevel", "undevelop"));
	topNode.nodes[0].nodes[3].addNode(new Node("evidence 1", "evidence"));
	topNode.nodes[0].nodes[3].nodes[0].addNode(new Node("strategy", "strategy"));
	topNode.nodes[0].nodes[3].nodes[0].nodes[0].addNode(new Node("goal 1", "goal"));
	topNode.nodes[0].nodes[3].nodes[0].nodes[0].addNode(new Node("goal 2", "goal"));
	topNode.nodes[0].nodes[3].nodes[0].nodes[0].addNode(new Node("goal 3", "goal"));
	topNode.nodes[0].nodes[3].addNode(new Node("evidence 2", "evidence"));
	topNode.nodes[0].nodes[3].addNode(new Node("evidence 3", "evidence"));
	return topNode;
}

function movePoint(root) {
	bg_touch = true;
	var begin = new Date();
	var id = setInterval(function() {
		var time = new Date() - begin;
		var r = time / ANIME_MSEC;
		if(r < 1.0) {
			root.moveInterval(r);
		} else {
			clearInterval(id);
			root.moveEnd();
			bg_touch = false;
		}
		root.paintLine();
	}, 1000/60);
}

function drawMain() {
	var n = 10;
	rootCanvas = document.body;
	rootCanvas.style.position = "absolute";
	rootCanvas.style.left = n;
	rootCanvas.style.top  = n;
	rootCanvas.style.overflow = "hidden";
	rootCanvas.style.width  = $(document).width()  - n*2;
	rootCanvas.style.height = $(document).height() - n*2;
	rootCanvas.width  = $(document).width()  - n*2;
	rootCanvas.height = $(document).height() - n*2;

	var D = document.createElement("div");//for debug
	D.style.left = 0;
	D.style.top = 0;
	D.innerHTML = "";
	document.body.appendChild(D);

	var root = createNode();
	var shiftX = 0;
	var shiftY = 0;
	var dw = $(rootCanvas).width();
	root.calcLocationAll = function() {
		var w = root.calcLocation(0, 0);
		root.calcLocation((dw-w)/2 + shiftX, shiftY);
		movePoint(root);
	}
	var w = root.calcLocation(0, 0);
	root.calcLocation((dw-w)/2 + shiftX, shiftY);
	root.moveEnd();
	root.paintLine();

	var x0 = 0;
	var y0 = 0;
	var dragX = 0;
	var dragY = 0;
	var flag = false;
	window.onresize = function(e) {
		dw = $(window).width();
		console.log(dw);
		root.calcLocationAll();
	}
	document.onmousedown = function(e) {
		if(bg_touch) return;
		x0 = e.pageX;
		y0 = e.pageY;
		w = root.calcLocation(0, 0);
		flag = true;
	}
	document.onmousemove = function(e) {
		if(bg_touch) return;
		if(flag) {
			dragX = e.pageX - x0;
			dragY = e.pageY - y0;
			root.calcLocation((dw-w)/2 + shiftX + dragX, shiftY + dragY);
			root.moveEnd();
			root.paintLine();
		}
	}
	document.onmouseup = function(e) {
		if(flag) {
			shiftX += e.pageX - x0;
			shiftY += e.pageY - y0;
			dragX = 0;
			dragY = 0;
			root.calcLocation((dw-w)/2 + shiftX + dragX, shiftY + dragY);
			root.moveEnd();
			root.paintLine();
			flag = false;
		}
	}
	var flagResize = false;
	var touchStart = 0;
	var dist = 0;
	function get_dist(x, y) { return Math.sqrt(x*x + y*y); }
	document.ontouchstart = function(e) {
		if(bg_touch) return;
		e.preventDefault();
		if(e.touches.length == 1) {
			e = e.touches[0];
			x0 = e.pageX;
			y0 = e.pageY;
			w = root.calcLocation(0, 0);
			touchStart = new Date();
			flag = true;
		} else if(e.touches.length == 2) {
			flagResize = true;
			dist = get_dist(e.touches[0].pageX - e.touches[1].pageX, 
					e.touches[0].pageY - e.touches[1].pageY);
		}
	}
	document.ontouchmove = function(e) {
		e.preventDefault();
		if(e.touches.length != 1) flag = false;
		if(flag) {
			e = e.touches[0];
			dragX = e.pageX - x0;
			dragY = e.pageY - y0;
			root.calcLocation((dw-w)/2 + shiftX + dragX, shiftY + dragY);
			root.moveEnd();
			root.paintLine();
		} else if(flagResize) {
			var r = get_dist(e.touches[0].pageX - e.touches[1].pageX, 
					e.touches[0].pageY - e.touches[1].pageY) / dist;
		}
	}
	document.ontouchend = function(e) {
		e.preventDefault();
		if(flag) {
			e = e.touches[0];
			shiftX += dragX;
			shiftY += dragY;
			dragX = 0;
			dragY = 0;
			root.calcLocation((dw-w)/2 + shiftX + dragX, shiftY + dragY);
			root.moveEnd();
			root.paintLine();
			flag = false;
		}
	}
}

