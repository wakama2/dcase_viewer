var DNodeEditWindow = (function() {
	var DNodeEditWindow = new Object();
	var self = DNodeEditWindow;
	var $select;
	var $desc;
	var selectedType = null;
	var success = null;
	var node = null;

	DNodeEditWindow.open = function(_node, selectable, _success) {
		success = _success;
		node = _node;
		if(selectable == null) {
			selectable = DNode.TYPES;
		}
		$select.empty();
		$.each(selectable, function(i, type) {
			$("<option></option>")
				.attr("id", "edit-option-" + type)
				.html(type)
				.appendTo($select);
		});
		if(node != null) {
			selectedType = node.type;
			$select.attr("disabled", true);
			$desc.attr("value", node.text);
		} else {
			selectedType = selectable[0];
			$select.attr("disabled", false);
			$desc.attr("value", "");
		}
		$("edit-option-" + selectedType).attr("selected", true);
		$("#edit").show();
	};

	DNodeEditWindow.applyAndClose = function() {
		if(node != null) {
			node.text = $desc.attr("value");
		} else {
			node = new DNode(-1, "NewNode", selectedType, $desc.attr("value"));
		}
		self.close();
		success(node);
	};

	DNodeEditWindow.close = function() {
		$("#edit").hide();
	};

	$(function() {
		$desc = $("#edit textarea");
		$("#edit").css({
			left: ($(document).width()  - $("#edit").width()) / 2,
			top : ($(document).height() - $("#edit").height()) / 2,
		});
		$("#edit-ok").click(function() {
			DNodeEditWindow.applyAndClose();
		});
		$("#edit-cancel").click(function() {
			DNodeEditWindow.close();
		});
		$select = $("#edit select");
		$select.change(function() {
			$("select option:selected").each(function() {
				selectedType = this.text;
			});
		});
	});

	return DNodeEditWindow;
}());

