//-------------------------------------
// const
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 60;

//-------------------------------------
// global
var shiftX = 0;
var shiftY = 0;
var dragX = 0;
var dragY = 0;

function createNode() {
	var topNode = new Node(0, "TopGoal", "goal",
			"ウェブショッピングデモ<br>" +
			"システムはDEOSプロセスにより運用され，ODSを満たしている");
	var str = new Node(1, "Strategy", "strategy", "description");
	topNode.addChild(new Node(2, "Context", "context", "this is context"));
	topNode.addChild(new Node(2, "Context2", "context", "this is context"));
	topNode.addChild(str);
	str.addChild(new Node(1, "SubGoal 1", "goal", "description"));
	str.addChild(new Node(1, "SubGoal 2", "goal", "description"));
	str.addChild(new Node(1, "SubGoal 3", "goal", "description"));
	str.addChild(new Node(1, "SubGoal 4", "goal", "description"));
	str.children[1].addChild(new Node(1, "Evidence", "evidence", "description"));
	str.children[2].addChild(new Node(1, "SubGoalContext", "context", "description"));
	return topNode;
}

function drawMain() {
	var rootcv = document.body;
	rootcv.style.position = "absolute";
	rootcv.style.left = 0;
	rootcv.style.top  = 0;
	rootcv.style.overflow = "hidden";
	rootcv.style.width  = $(document).width();
	rootcv.style.height = $(document).height();
	rootcv.width  = $(document).width();
	rootcv.height = $(document).height();

	var svgroot = document.getElementById("svgroot");
	svgroot.style.position = "absolute";
	svgroot.style.left = 0;
	svgroot.style.top  = 0;
	svgroot.style.width  = $(document).width();
	svgroot.style.height = $(document).height();
	svgroot.width  = $(document).width();
	svgroot.height = $(document).height();

	var divroot = document.getElementById("divroot");
	divroot.style.position = "absolute";
	divroot.style.left = 0;
	divroot.style.top  = 0;
	divroot.style.width  = $(document).width();
	divroot.style.height = $(document).height();
	divroot.width  = $(document).width();
	divroot.height = $(document).height();

	//var D = document.createElement("div");//for debug
	//D.style.left = 0;
	//D.style.top = 0;
	//D.innerHTML = "";
	//document.body.appendChild(D);

	var root = createNode();
	View.prototype.repaintAll = function(ms) {
		var p = root.view.updateLocation(0, 0);
		root.view.updateLocation(
				($(rootcv).width()-p.x)/2 + shiftX + dragX, shiftY + dragY);
		root.view.animateSec(ms);
	}
	root.view.repaintAll(0);

	setEventHandler(rootcv, root.view);
}

