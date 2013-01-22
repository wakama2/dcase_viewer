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

	var inputName = $("<input></input>").attr({type: "text", value: node.name});
	var inputType = $("<input></input>").attr({type: "text", value: node.type});
	var inputDesc = $("<textarea></textarea>").attr({
		type: "text", value: node.text
	}).css({
		width: "80%"
	});

	dom.append($("<p>Name<br></p>").append(inputName))
			.append($("<p>Type<br></p>").append(inputType))
			.append($("<p>Description<br></p>").append(inputDesc))
			.append($("<input></input>").attr({
					type: "button", value: "OK"
				}).click(function() {
					self.applyAndClose();
				}))
			.append($("<input></input>").attr({
					type: "button", value: "Cancel"
				}).click(function() {
					self.close();
				}))
			;
	$(document.body).append(dom);

	this.applyAndClose = function() {
		node.name = $(inputName).attr("value");
		node.type = $(inputType).attr("value");
		node.text = $(inputDesc).attr("value");
		do_ok();
		self.close();
	}

	this.close = function() {
		dom.remove();
	}
}

