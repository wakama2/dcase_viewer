//-----------------------------------------------------------------------------

var DNode = function(id, name, type, desc) {
	this.id = id;
	this.name = name;
	this.desc = desc;
	this.type = type;
	this.children = [];
	this.context = null;
	this.parents = [];
	this.prevVersion = null;
	this.nextVersion = null;

	this.updateFlags();
	if(type == "Solution") {
		this.isDScript = true;
	}
	if(type == "Context" || type == "Subject" || type == "Rebuttal") {
		this.isContext = true;
	}
};

DNode.prototype.isContext = false;
DNode.prototype.isArgument = false;
DNode.prototype.isUndeveloped = false;
DNode.prototype.isDScript = false;

//-----------------------------------------------------------------------------

DNode.prototype.getNodeCount = function() {
	return this.children.length + (this.context != null ? 1 : 0);
};

DNode.prototype.eachNode = function(f) {
	$.each(this.children, function(i, node) {
		f(node);
	});
	if(this.context != null) {
		f(this.context);
	}
};

DNode.prototype.traverse = function(f, parent, index) {
	f(this, parent, index);
	var self = this;
	$.each(this.children, function(i, node) {
		node.traverse(f, self, i);
	});
	if(this.context != null) {
		f(this.context);
	}
};

//-----------------------------------------------------------------------------

DNode.prototype.addChild = function(node, index) {
	// TODO index
	if(!node.isContext) {
		this.children.push(node);
	} else {
		this.context = node;
	}
	node.parents.push(this);
	this.updateFlags();
};

DNode.prototype.removeChild = function(node) {
	if(this.context == node) {
		this.context = null;
	} else {
		var n = this.children.indexOf(node);
		if(n != -1) {
			this.children.splice(n, 1);
		}
	}
	this.updateFlags();
};

DNode.prototype.updateFlags = function() {
	if(this.type == "Goal") {
		this.isArgument = this.context != null;
		this.isUndeveloped = this.children.length == 0;
	}
};

DNode.prototype.getHtmlDescription = function() {
	if(this.desc == "") {
		return "<font color=\"gray\">(no description)</font>";
	} else {
		return this.desc
			.replace(/</g, "&lt;").replace(/>/g, "&gt;")
			.replace(/\n/g, "<br>");
	}
};

DNode.prototype.toJson = function() {
	var children = [];
	this.eachNode(function(node) {
		children.push(node.toJson());
	});
	return {
		id: this.id,
		name: this.name,
		type: this.type,
		description: this.desc,
		children: children
	};
};

//-----------------------------------------------------------------------------

DNode.TYPES = [
	"Goal", "Context", "Subject",
	"Strategy", "Evidence", "Solution", "Rebuttal"
];

DNode.SELECTABLE_TYPES = {
	"Goal": [ "Goal", "Context", "Subject", "Strategy", "Evidence", "Solution" ],
	"Context": [],
	"Subject": [],
	"Strategy": [ "Context", "Goal" ],
	"Evidence": [ "Rebuttal" ],
	"Solution": [ "Context", "Rebuttal" ],
	"Rebuttal": [],
};

//-----------------------------------------------------------------------------

var Argument = function(topGoal, argId, commitId) {
	this.node = topGoal;
	this.commitId = commitId;
	this.argId = argId;
	this.opQueue = [];
	this.undoCount = 0;
};

Argument.prototype.isChanged = function() {
	return this.opQueue.length - this.undoCount > 0;
};

Argument.prototype.getCommitList = function() {
	var list = DCaseAPI.call("getCommitList", { commitId: this.commitId });
	return list.commitIdList;
};

Argument.prototype.undo = function() {
	var n = this.opQueue.length;
	if(n > this.undoCount) {
		this.undoCount++;
		var op = this.opQueue[n - this.undoCount];
		op.undo();
		return true;
	} else {
		return false;
	}
};

Argument.prototype.redo = function() {
	if(this.undoCount > 0) {
		var op = this.opQueue[this.opQueue.length - this.undoCount];
		this.undoCount--;
		op.redo();
		return true;
	} else {
		return false;
	}
};

Argument.prototype.applyOperation = function(op) {
	this.opQueue.push(op);
	this.undoCount = 0;
	op.redo();
};

Argument.prototype.commit = function(msg) {
	var tl = [];
	var id = 1;
	var node = this.node;
	node.traverse(function(node) {//FIXME
		node.id = id++;
	});
	node.traverse(function(node) {
		var c = [];
		node.eachNode(function(node) {
			c.push(node.id);
		});
		tl.push({
			ThisNodeId: node.id,
			NodeType: node.type,
			Description: node.desc,
			Children: c,
		});
	});
	var r = DCaseAPI.call("commit", {
		tree: {
			NodeList: tl,
			TopGoalId: node.id,
		},
		message: msg,
		commitId: this.commitId,
	});
	this.commitId = r.commitId;
	this.undoCount = 0;
	this.opQueue = [];
	return true;
};

Argument.prototype.getTopGoal = function() {
	return this.node;
};

///var id_count = 1;
//function createNodeFromJson2(json) {
//	var id = json.id != null ? parseInt(json.id) : id_count++;
//	var desc = json.desc ? json.desc : contextParams(json.prop);
//	var node = new DNode(0, json.name, json.type, desc);
//	if(json.prev != null) {
//		node.prevVersion = createNodeFromJson2(json.prev);
//		node.prevVersion.nextVersion = node;
//	}
//	if(json.children != null) {
//		for(var i=0; i<json.children.length; i++) {
//			var child = createNodeFromJson2(json.children[i]);
//			node.addChild(child);
//		}
//	}
//	return node;
//}
//
//function createSampleNode() {
//	var strategy_children = [
//		{
//			name: "SubGoal 1", type: "Goal", desc: "description",
//			children: [ 
//				{ name: "C", type: "Subject", prop: { "D-Script.Name": "test" } },
//				{ name: "test", type: "Goal", desc: "goal1" },
//				{ name: "test", type: "Goal", desc: "goal2" }
//			]
//		},
//		{
//			name: "SubGoal 2", type: "Goal", desc: "description",
//			children: [
//				{ name: "Context 2", type: "Context", desc: "" }
//			],
//			prev: { name: "SubGoal 2 old", type: "Goal", desc: "old version" }
//		},
//		{
//			name: "SubGoal 3", type: "Goal", desc: "description",
//			children: [
//				{ name: "Context 3.1", type: "Context", desc: "description" },
//				{ name: "SubGoal 3.1", type: "Goal", desc: "description" },
//				{ name: "SubGoal 3.2", type: "Goal", desc: "description", 
//					children: [ {
//						name: "D-Script", type: "DScript", desc: "shutdown -r now",
//						children: [ { name: "R", type: "Rebuttal", desc: "error" } ],
//					} ] },
//				{ name: "SubGoal 3.3", type: "Goal", desc: "description" },
//				{ name: "SubGoal 3.3", type: "Goal", desc: "description" },
//			]
//		},
//		{ name: "SubGoal 4", type: "Goal", desc: "description" }
//	];
//	return createNodeFromJson2({
//		name: "TopGoal", type: "Goal",
//		desc: "ウェブショッピングデモ\n" +
//					"システムはDEOSプロセスにより運用され，OSDを満たしている",
//		children: [
//			{
//				name: "Context",
//				type: "Context",
//				desc: "サービス用件:\n" +
//							"・アクセス数の定格は2500件/分\n" +
//							"・応答時間は1件あたり3秒以内\n" +
//							"・一回の障害あたりの復旧時間は5分以内\n"
//			},
//			{
//				name: "Strategy", type: "Strategy", desc: "DEOSプロセスによって議論する",
//				children: strategy_children
//			}
//		]
//	});
//}

