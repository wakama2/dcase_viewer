//-------------------------------------
// const
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 100;
var SCALE_MIN = 0.2;
var SCALE_MAX = 6.0;

//-------------------------------------
// global
var shiftX = 0;
var shiftY = 0;
var dragX = 0;
var dragY = 0;
var scale = 1.0;

//-------------------------------------
function createNodeFromJson() {
	var json = JSON.parse(samplejson);
	console.log(json);
	var nodes = [];
	for(var i=0; i<json.nodes.length; i++) {
		var c = json.nodes[i];
		nodes[c.name] = c;
	}
	function createRec(l, node) {
		for(var i=0; i<l.children.length; i++) {
			var child = l.children[i];
			var n = nodes[child.name];
			var newNode = new Node(0, n.name, n.DBNodeType, n.description);
			node.addChild(newNode);
			createRec(child, newNode);
		}
	}
	var topNode = new Node(0, "TopGoal", "Goal", "");
	createRec(json.links, topNode);
	return topNode;
}

function createNode() {
	var topNode = new Node(0, "TopGoal", "Goal",
			"ウェブショッピングデモ<br>" +
			"システムはDEOSプロセスにより運用され，ODSを満たしている");
	var str = new Node(1, "Strategy", "Strategy", "DEOSプロセスによって議論する");
	topNode.addChild(new Node(2, "Context", "Context",
		"サービス用件:<br>" +
		"・アクセス数の定格は2500件/分<br>" +
		"・応答時間は1件あたり3秒以内<br>" +
		"・一回の障害あたりの復旧時間は5分以内"
		));
	topNode.addChild(new Node(2, "Context2", "Context", "現在のシステムの運用状態"));
	topNode.addChild(new Node(2, "Context2", "Context", "Risk分析の結果<br>・アクセス数の増大<br>応答遅延"));
	topNode.addChild(str);
	str.addChild(new Node(1, "SubGoal 1", "Goal", "description"));
	str.children[0].addChild(new Node(1, "test", "Context", "description"));
	str.addChild(new Node(1, "SubGoal 2", "Goal", "description"));
	str.addChild(new Node(1, "SubGoal 3", "Goal", "description"));
	str.addChild(new Node(1, "SubGoal 4", "Goal", "description"));
	str.children[2].addChild(new Node(1, "SubGoal 1.1", "Goal", "description"));
	str.children[2].addChild(new Node(1, "SubGoal 1.2", "Goal", "description"));
	str.children[2].addChild(new Node(1, "SubGoal 1.3", "Goal", "description"));
	str.children[2].addChild(new Node(1, "SubGoal 1.3", "Goal", "description"));
	str.children[2].addChild(new Node(1, "SubGoal 1.4", "Goal", "description"));
	str.children[1].addChild(new Node(1, "Evidence", "Evidence", "description"));
	str.children[1].children[0].state = "error";
	str.children[2].addChild(new Node(1, "SubGoalContext", "Context", "description"));
	return topNode;
}

function drawMain(rootcv) {
	rootcv.className = "viewer-body";

	var svgroot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgroot.id = "svgroot";
	svgroot.style.position = "absolute";
	svgroot.style.left = 0;
	svgroot.style.top  = 0;
	svgroot.style.width  = "100%";
	svgroot.style.height = "100%";
	rootcv.appendChild(svgroot);

	var divroot = document.createElement("divroot");
	divroot.className = "viewer-body";
	divroot.id = "divroot";
	rootcv.appendChild(divroot);

	//var D = document.createElement("div");//for debug
	//D.style.left = 0;
	//D.style.top = 0;
	//D.innerHTML = "";
	//document.body.appendChild(D);

	var root = createNode();
	//var root = createNodeFromJson();
	View.prototype.repaintAll = function(ms) {
		root.view.updateLocation((shiftX + dragX) / scale, (shiftY + dragY) / scale);
		root.view.animateSec(ms);
	}
	shiftX = ($(rootcv).width() - root.view.updateLocation(0, 0).x * scale)/2;
	shiftY = 20;
	root.view.repaintAll(0);

	setEventHandler(rootcv, root.view);
}

