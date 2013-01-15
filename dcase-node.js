/* class Node */
var Node = function(id, name, type, text) {
	this.id = id;
	this.name = name;
	this.text = text;
	this.type = type;
	this.state = "normal";
	this.children = [];
	this.contexts = [];
	this.parents = [];
}

Node.prototype.addChild = function(node) {
	if(node.type != "Context") {
		this.children.push(node);
	} else {
		this.contexts.push(node);
	}
	node.parents.push(this);
}

//-------------------------------------
function createNodeFromURL(url) {
	var a = $.ajax({
		type: "GET",
		url : url,
		async: false,
		dataType: "json",
	});
	return createNodeFromJson(JSON.parse(a.responseText));
}

function createNodeFromJson(json) {
	console.log(json);
	var nodes = [];
	for(var i=0; i<json.nodes.length; i++) {
		var c = json.nodes[i];
		nodes[c.name] = c;
	}
	function createChildren(l, node) {
		for(var i=0; i<l.children.length; i++) {
			var child = l.children[i];
			var n = nodes[child.name];
			var newNode = new Node(0, n.name, n.DBNodeType, n.description);
			node.addChild(newNode);
			createChildren(child, newNode);
		}
	}
	var n = nodes[json.links.name];
	var topNode = new Node(0, n.name, n.DBNodeType, n.description);
	createChildren(json.links, topNode);
	return topNode;
}

function createBinNode(n) {
	if(n > 0) {
		var node = new Node(0, "Goal", "Goal", "description");
		node.addChild(createBinNode(n-1));
		node.addChild(createBinNode(n-1));
		return node;
	} else {
		return new Node(0, "Goal", "Goal", "description");
	}
}

function createSampleNode() {
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

