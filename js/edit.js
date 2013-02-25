var DNodeEditWindow = (function() {
	var self = this;
	var $select;
	var $desc;
	var selectedType = null;
	var success = null;
	var node = null;

	function init() {
		$desc = $("#edit textarea");
		$("#edit").css({
			left: ($(document).width() - $("#edit").width()) / 2,
			top : ($(document).height() - $("#edit").height()) / 2,
		});
		$("#edit-ok").click(function() {
			DNodeEditWindow.applyAndClose();
		});
		$("#edit-cancel").click(function() {
			DNodeEditWindow.close();
		});
		$select.change(function() {
			$("select option:selected").each(function() {
				selectedType = this.text;
			});
		});
	}

	this.open = function(node, success) {
		self.success = success;
		self.node = node;

		$select = $("#edit select");
		if(node != null) {
			selectedType = node.type;
			$select.attr("disabled", true);
			$desc.attr("value", node.text);

			$select.empty();
			$.each(DNode.SELECTABLE_TYPES[node.type], function(i, type) {
				$("<option></option>")
					.attr("id", "edit-option-" + type)
					.html(type)
					.appendTo($select);
			});

		} else {
			selectedType = DNode.TYPES[0];
			$select.attr("disabled", false);
			$desc.attr("value", "");

			$select.empty();
			$.each(DNode.TYPES, function(i, type) {
				$("<option></option>")
					.attr("id", "edit-option-" + type)
					.html(type)
					.appendTo($select);
			});
		}

		$("edit-option-" + selectedType).attr("selected", true);
		$("#edit").show();
	}

	this.applyAndClose = function() {
		var node = self.node;
		if(node != null) {
			node.text = $desc.attr("value");
		} else {
			node = new DNode(-1, "NewNode", selectedType, $desc.attr("value"));
		}
		self.close();
		self.success(node);
	}

	this.close = function() {
		$("#edit").hide();
	}

	$(function() {
		init();
	});

	return this;
}());

