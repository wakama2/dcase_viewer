/* class DNode */
var DNode = function(id, name, type, text) {
	this.id = id;
	this.name = name;
	this.text = text;
	this.type = type;
	this.children = [];
	this.context = null;
	this.parents = [];
	this.prevVersion = null;
	this.nextVersion = null;
}

DNode.prototype.addChild = function(node) {
	if(node.type != "Context") {
		this.children.push(node);
	} else {
		this.context = node;
	}
	node.parents.push(this);
}

DNode.prototype.removeChild = function(node) {
	if(this.context == node) {
		this.context = null;
	} else {
		var n = this.children.indexOf(node);
		this.children.splice(n, 1);
	}
}

DNode.prototype.isArgument = function() {
	return this.context != null && this.type == "Goal";
}

DNode.prototype.isUndevelop = function() {
	return this.children.length == 0 && this.type == "Goal";
}

DNode.getTypes = function() {
	return [
			"Goal", "Context", "Strategy", "Evidence", "Monitor", "DScriptContext", "DScriptEvidence", "Rebuttal",
	];
}

//-------------------------------------

DNode.prototype.isDScript = function() {
	return this.type == "DScriptEvidence";
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

function contextParams(params) {
	var s = "";
	for(key in params) {
		s += "@" + key + " : " + params[key] + "\n";
	}
	return s;
}

function createNodeFromJson(json) {
	console.log(json);
	var nodes = [];
	for(var i=0; i<json.nodes.length; i++) {
		var c = json.nodes[i];
		nodes[c.node_id] = c;
	}
		
	function createChildren(l, node) {
		for(var i=0; i<l.children.length; i++) {
			var child = l.children[i];
			var n = nodes[child.node_id];
			n.name = n.type.charAt(0) + n.node_id;
			var desc = n.description ? n.description : contextParams(n.properties);
			var newNode = new DNode(n.node_id, n.name, n.type, desc);
			newNode.isEvidence = n.isEvidence;
			node.addChild(newNode);
			createChildren(child, newNode);
		}
	}
	var n = nodes[json.links.node_id];
	var topNode = new DNode(0, "TopGoal", n.type, n.description);
	createChildren(json.links, topNode);
	return topNode;
}

function createBinNode(n) {
	if(n > 0) {
		var node = new DNode(0, "Goal", "Goal", "description");
		node.addChild(createBinNode(n-1));
		node.addChild(createBinNode(n-1));
		return node;
	} else {
		return new DNode(0, "Goal", "Goal", "description");
	}
}

var id_count = 1;
function createNodeFromJson2(json) {
	var id = json.id != null ? parseInt(json.id) : id_count++;
	var desc = json.desc ? json.desc : contextParams(json.prop);
	var node = new DNode(0, json.name, json.type, desc);
	if(json.prev != null) {
		node.prevVersion = createNodeFromJson2(json.prev);
		node.prevVersion.nextVersion = node;
	}
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
			children: [ 
				{ name: "C", type: "DScriptContext", prop: { "D-Script.Name": "test" } },
				{ name: "test", type: "Goal", desc: "goal1" },
				{ name: "test", type: "Goal", desc: "goal2" }
			]
		},
		{
			name: "SubGoal 2", type: "Goal", desc: "description",
			children: [
				{ name: "Context 2", type: "Context", desc: "" }
			],
			prev: { name: "SubGoal 2 old", type: "Goal", desc: "old version" }
		},
		{
			name: "SubGoal 3", type: "Goal", desc: "description",
			children: [
				{ name: "Context 3.1", type: "Context", desc: "description" },
				{ name: "SubGoal 3.1", type: "Goal", desc: "description" },
				{ name: "SubGoal 3.2", type: "Goal", desc: "description", 
					children: [ {
						name: "reboot.ds", type: "DScriptEvidence", desc: "shutdown -r now",
						children: [ { name: "R", type: "Rebuttal", desc: "error" } ],
					} ] },
				{ name: "SubGoal 3.3", type: "Goal", desc: "description" },
				{ name: "SubGoal 3.3", type: "Goal", desc: "description" },
			]
		},
		{ name: "SubGoal 4", type: "Goal", desc: "description" }
	];
	return createNodeFromJson2({
		name: "TopGoal", type: "Goal",
		desc: "ウェブショッピングデモ\n" +
					"システムはDEOSプロセスにより運用され，OSDを満たしている",
		children: [
			{
				name: "Context",
				type: "Context",
				desc: "サービス用件:\n" +
							"・アクセス数の定格は2500件/分\n" +
							"・応答時間は1件あたり3秒以内\n" +
							"・一回の障害あたりの復旧時間は5分以内\n"
			},
			{
				name: "Strategy", type: "Strategy", desc: "DEOSプロセスによって議論する",
				children: strategy_children
			}
		]
	});
}

