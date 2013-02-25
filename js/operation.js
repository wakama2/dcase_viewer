/* abstract class DNodeOperation */
var DNodeOperation = function() {
	
};

//-----------------------------------------------------------------------------
/* class InsertOperation extends DNodeOperation */
var InsertOperation = function(parent, node, index) {
	this.parent = parent;
	this.node = node;
	this.index = index;
};

InsertOperation.prototype = Object.create(DNodeOperation.prototype);

InsertOperation.prototype.undo = function() {
	this.parent.removeChild(this.node);
};

InsertOperation.prototype.redo = function() {
	this.parent.addChild(this.node, this.index);
};

//-----------------------------------------------------------------------------
/* class RemoveOperation extends DNodeOperation */
var RemoveOperation = function(parent, node, index) {
	this.parent = parent;
	this.node = node;
	this.index = index;
	if(index == null) {
		this.index = parent.children.indexOf(node);
	}
};

RemoveOperation.prototype = Object.create(DNodeOperation.prototype);

RemoveOperation.prototype.undo = function() {
	this.parent.addChild(this.node, this.index);
};

RemoveOperation.prototype.redo = function() {
	this.parent.removeChild(this.node);
};

//-----------------------------------------------------------------------------
/* class EditOperation extends DNodeOperation */
var EditOperation = function(node, prevDesc, nextDesc) {
	this.node = node;
	this.prevDesc = prevDesc;
	this.nextDesc = nextDesc;
};

EditOperation.prototype = Object.create(DNodeOperation.prototype);

EditOperation.prototype.undo = function() {
	this.node.desc = this.prevDesc;
};

EditOperation.prototype.redo = function() {
	this.node.desc = this.nextDesc;
};

