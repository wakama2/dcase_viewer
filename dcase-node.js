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

Node.prototype.isArgument = function() {
	return this.contexts.length != 0 && this.type == "Goal";
}

Node.prototype.isUndevelop = function() {
	return this.children.length == 0 && this.type == "Goal";
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

function createNodeFromJson2(json) {
	var node = new Node(0, json.name, json.type, json.desc);
	if(json.children != null) {
		for(var i=0; i<json.children.length; i++) {
			var child = createNodeFromJson2(json.children[i]);
			node.addChild(child);
		}
	}
	return node;
}

function createSampleNode() {
	var strategy_children = [
		{
			name: "SubGoal 1", type: "Goal", desc: "description",
			children: [ { name: "test", type: "Context", desc: "description" } ]
		},
		{
			name: "SubGoal 2", type: "Goal", desc: "description",
			children: [ { name: "Evidence 2", type: "Evidence", desc: "description" } ]
		},
		{
			name: "SubGoal 3", type: "Goal", desc: "description",
			children: [
				{ name: "Context 3.1", type: "Context", desc: "description" },
				{ name: "SubGoal 3.1", type: "Goal", desc: "description" },
				{ name: "SubGoal 3.2", type: "Goal", desc: "description", 
					children: [ { name: "Evidence 3.2", type: "Evidence", desc: "" } ] },
				{ name: "SubGoal 3.3", type: "Goal", desc: "description" },
				{ name: "SubGoal 3.3", type: "Goal", desc: "description" },
			]
		},
		{ name: "SubGoal 4", type: "Goal", desc: "description" }
	];
	return createNodeFromJson2({
		name: "TopGoal", type: "Goal",
		desc: "ウェブショッピングデモ<br>" +
					"システムはDEOSプロセスにより運用され，ODSを満たしている",
		children: [
			{
				name: "Context",
				type: "Context",
				desc: "サービス用件:<br>" +
							"・アクセス数の定格は2500件/分<br>" +
							"・応答時間は1件あたり3秒以内<br>" +
							"・一回の障害あたりの復旧時間は5分以内"
			},
			{ name: "Context2", type: "Context", desc: "現在のシステムの運用状態" },
			{ name: "Context2", type: "Context", desc: "Risk分析の結果<br>・アクセス数の増大<br>応答遅延" },
			{
				name: "Strategy", type: "Strategy", desc: "DEOSプロセスによって議論する",
				children: strategy_children
			}
		]
	});
}

