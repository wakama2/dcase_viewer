var SideMenu = function(root, viewer) {
	var self = this;
	var timeline = new TimeLine(root, viewer);

	//--------------------------------------------------------

	this.actInsertToSelectedNode = function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			var sel = DNode.SELECTABLE_TYPES[view.node.type];
			DNodeEditWindow.open(null, sel, function(newNode) {
				var op = new InsertOperation(view.node, newNode);
				viewer.getArgument().applyOperation(op);
				viewer.structureUpdated();
			});
		}
	}

	this.actRemoveSelectedNode = function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			var parents = view.node.parents;
			if(parents.length > 0) {
				if(confirm("ノードを削除しますか？")) {
					var op = new RemoveOperation(parents[0], view.node);
					viewer.getArgument().applyOperation(op);
					viewer.structureUpdated();
				}
			}
		}
	}

	this.show = function(m) {
		var ids = [
			"#menu-search",
			"#menu-export",
			"#menu-info",
			"#menu-tool",
			"#menu-proc"
		];
		$.each(ids, function(i, id) {
			if(m == id) $(id).toggle();
			else $(id).hide();
		});
	}

	//--------------------------------------------------------
	var $search = $("#menu-search-i")
			.click(function(e) {
				self.show("#menu-search");
				$("#menu-search input").focus();
			})
			.appendTo(root);

	$("#menu-search input").blur(function(e) {
		clearInterval(this.interval_id);
		delete this.interval_id;
	}).keydown(function (e) {
		if (e.keyCode == 13) { // Enter key
			var i = this;
			var r = DCaseAPI.search(i.value);
			self.search_inc(i.value);
		}
	});

	this.search = function(text) {
		var $res = $("#menu-search ul");
		$res.empty();
		text = text.toLowerCase();
		function getPreviewText(target, text) { // [TODO] add color
			var index = target.toLowerCase().indexOf(text);
			var ret = target.substr(0, index) +
				"<b>" + target.substr(index, text.length) +
				"</b>" + target.substr(index + text.length)
			return ret;
		};
		function showResult($res, v, name, desc) {
			$("<ul>")
					.addClass("sidemenu-result")
					.html("<li>" + name + "</li>")
					//.html("<li>" + name + "<ul>" + desc + "</ul></li>")
					.click(function() {
						viewer.centerize(v, 500);
					})
					.appendTo($res);
		};
		function cmp(v) {
			var name = v.node.name;
			var desc = v.node.text;
			var d_index = desc.toLowerCase().indexOf(text);
			var n_index = name.toLowerCase().indexOf(text);
			if(d_index != -1 || n_index != -1) {
				var ptext = getPreviewText(desc, text);
				showResult($res, v, name, ptext);
			}
			v.forEachNode(cmp);
		}
		cmp(viewer.rootview);
	}

	var prev_isesarch = "";
	this.search_inc = function(text) {
		if(text !== prev_isesarch) {
			this.search(text);
		}
		prev_isesarch = text;
	}

	// init search list
	//this.search("");

	//--------------------------------------------------------
	var $export = $("#menu-export-i")
			.click(function(e) {
				self.show("#menu-export");
			})
			.appendTo(root);

	var URL_EXPORT = "cgi/view.cgi";

	this.exportTree = function(type) {
		var commitId = viewer.getArgument().commitId;
		var url = URL_EXPORT + "?" + commitId + "." + type;
		window.open(url, "_black");
	};

	$("#menu-export-json").click(function() {
		self.exportTree("json");
	});

	$("#menu-export-png").click(function() {
		self.exportTree("png");
	});

	$("#menu-export-script").click(function() {
		self.exportTree("dscript");
	});

	//--------------------------------------------------------
	var $info = $("#menu-info-i")
			.click(function(e) {
				self.show("#menu-info");
			})
			.appendTo(root);
	
	//(function() {
	//	var types = DNode.TYPES;
	//	var count = {};
	//	for(var i=0; i<types.length; i++) {
	//		count[types[i]] = 0;
	//	}
	//	viewer.traverseAll(function(node) {
	//		count[node.type] += 1;
	//	});
	//	var $table = $("#menu-info-table");
	//	for(var i=0; i<types.length; i++) {
	//		var name = types[i];
	//		$("<tr></tr>")
	//			.append($("<td></td>").html(name))
	//			.append($("<td></td>").html(count[name]))
	//			.appendTo($table);
	//	}
	//})();

	//--------------------------------------------------------
	var $proc = $("#menu-proc-i")
			.click(function(e) {
				self.show("#menu-proc");
			})
			.appendTo(root);

	//--------------------------------------------------------
	var $tool = $("#menu-tool-i")
			.click(function(e) {
				self.show("#menu-tool");
			})
			.appendTo(root);

	function checkCommited() {
		var arg = viewer.getArgument();
		if(arg != null && arg.isChanged()) {
			if(!confirm("未コミットの変更がありますが，破棄しますか?")) {
				return false;
			}
		}
		return true;
	}

	function updateArgumentList() {
		var $res = $("#menu-proc ul");
		$res.empty();
		$.each(DCaseAPI.getArgumentList(), function(i, arg) {
			$.each(DCaseAPI.getBranchList(arg), function(i, br) {
				$("<li>")
					.addClass("sidemenu-result")
					.html(br)
					.click(function() {
						if(checkCommited()) {
							viewer.setArgument(DCaseAPI.getArgument(arg, br));
							timeline.repaint();
						}
					})
					.appendTo($res);
			});
			$("<hr>").appendTo($res);
		});
	}
	updateArgumentList();

	$("#menu-proc-commit").click(function() {
		var msg = prompt("コミットメッセージを入力して下さい");
		if(msg != null) {
			if(viewer.getArgument().commit(msg)) {
				timeline.repaint();
				alert("コミットしました");
			}
		}
	});

	$("#menu-proc-undo").click(function() {
		if(viewer.getArgument().undo()) {
			viewer.structureUpdated();
		}
	});

	$("#menu-proc-redo").click(function() {
		if(viewer.getArgument().redo()) {
			viewer.structureUpdated();
		}
	});

	$("#menu-proc-newarg").click(function() {
		DNodeEditWindow.open(null, ["Goal"], function(newNode) {
			if(checkCommited()) {
				viewer.setArgument(DCaseAPI.createArgument(newNode));
				timeline.repaint();
				updateArgumentList();
			}
		});
	});

};

