/* class Node */
var Node = function(id, name, type, text) {
	this.id = id;
	this.name = name;
	this.text = text;
	this.type = type;
	this.children = [];
	this.contexts = [];
	this.parents = [];
	this.view = new View(this);
}

Node.prototype.addChild = function(node) {
	if(node.type != "Context") {
		this.children.push(node);
	} else {
		this.contexts.push(node);
	}
	this.view.addChild(node);
	node.parents.push(this);
}

