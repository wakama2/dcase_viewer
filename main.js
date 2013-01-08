//-------------------------------------
// const
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 60;
var SCALE_MIN = 0.2;

//-------------------------------------
// global
var shiftX = 0;
var shiftY = 0;
var dragX = 0;
var dragY = 0;
var scale = 1.0;

//-------------------------------------
function createNode() {
	var topNode = new Node(0, "TopGoal", "goal",
			"ウェブショッピングデモ<br>" +
			"システムはDEOSプロセスにより運用され，ODSを満たしている");
	var str = new Node(1, "Strategy", "strategy", "DEOSプロセスによって議論する");
	topNode.addChild(new Node(2, "Context", "context",
		"サービス用件:<br>" +
		"・アクセス数の定格は2500件/分<br>" +
		"・応答時間は1件あたり3秒以内<br>" +
		"・一回の障害あたりの復旧時間は5分以内"
		));
	topNode.addChild(new Node(2, "Context2", "context", "現在のシステムの運用状態"));
	topNode.addChild(new Node(2, "Context2", "context", "Risk分析の結果<br>・アクセス数の増大<br>応答遅延"));
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
		//var p = root.view.updateLocation(0, 0);
		//var m = ($(rootcv).width() - root.view.updateLocation(0, 0).x)/2;
		root.view.updateLocation((shiftX + dragX) / scale, (shiftY + dragY)/scale);
		root.view.animateSec(ms);
	}
	shiftX = ($(rootcv).width() - root.view.updateLocation(0, 0).x)/2;
	root.view.repaintAll(0);

	setEventHandler(rootcv, root.view);
}

