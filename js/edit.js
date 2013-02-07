$(function() {
	var $s = $("#edit select")
	$.each(DNode.getTypes(), function(type) {
		$("<option></option>")
			.html(type)
			.appendTo($s);
	});
});

var DNodeEditWindow = function(viewer, node, do_ok) {
	var self = this;

	var dom = $("<div></div>").css({
		position: "absolute",
		left  : "10%",
		top   : "10%",
		right : "10%",
		bottom: "10%",
		background: "#EEEEEE",
		opacity: 0.9,
		borderStyle: "solid",
		borderColor: "#808080",
		zIndex: 10,
	})

	if(node.name != null) {
		
	}

	var typeSelected = node.type;
	var inputType = $("<select></select>").change(function() {
		$("select option:selected").each(function() {
			typeSelected = this.text;
		});
	});
	var inputDesc = $("<textarea></textarea>").attr({
		type: "text", value: node.text
	}).css({
		width: "80%"
	});

	$("#edit-ok").click(function() {
		self.applyAndClose();
	});

	$("#edit-cancel").click(function() {
		self.close();
	});

	this.applyAndClose = function() {
		node.type = typeSelected;
		node.text = $(inputDesc).attr("value");
		do_ok();
		self.close();
	}

	this.close = function() {
		dom.remove();
	}
}

