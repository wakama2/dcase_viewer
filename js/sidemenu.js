var SideMenu = function(root, viewer) {
	var width = 200;
	var animeTime = 250;
	var self = this;

	//--------------------------------------------------------
	this.actChangeLock = function() {
		var flag = !viewer.getDragLock();
		viewer.setDragLock(flag);
		this.value = flag ? "lock" : "unlock";
		viewer.setTextSelectable(!flag);
	}

	this.actEditSelectedNode = function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			DNodeEditWindow.open(view.node, function(node) {
				viewer.setModel(viewer.model);
				var r = DCaseAPI.update({
					argument_id: viewer.opts.argument_id,
					node_id: node.id,
					description: node.text
				});
			});
		}
	}

	this.actInsertToSelectedNode = function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			DNodeEditWindow.open(null, function(newNode) {
				view.node.addChild(newNode);
				viewer.setModel(viewer.model);
				var r = DCaseAPI.insert({
					new: {
						type: newNode.type,
						description: newNode.text,
					},
					argument_id: viewer.opts.argument_id,
					parent: {
						argument_id: viewer.opts.argument_id,
						node_id: view.node.id,
					}
				});
				newNode.id = r.node_id;
			});
		}
	}

	this.actRemoveSelectedNode = function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			if(confirm("ノードを削除しますか？")) {
				var parent = view.node.parents;
				if(parent.length > 0) {
					parent[0].removeChild(view.node);
					viewer.setModel(viewer.model);
					var r = DCaseAPI.del({
						argument_id: viewer.opts.argument_id,
						node_id: view.node.id,
					});
				}
			}
		}
	}

	this.actExportJson = function() {
		//TODO
		alert("TODO");
	}

	this.actExportPng = function() {
		//TODO
		alert("TODO");
	}

	this.actCommit = function() {
		var msg = prompt("コミットメッセージを入力して下さい");
		if(msg != null) {
			DCaseAPI.commit(msg);
		}
	}

	this.show = function(m) {
		var ids = [
			"#menu-search",
			"#menu-export",
			"#menu-info",
			"#menu-tool"
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

	$("#menu-search input").focus(function(e) {
		var i = this;
		this.interval_id = setInterval(function() {
			self.search_inc(i.value);
		}, 1000/5);
	}).blur(function(e) {
		clearInterval(this.interval_id);
		delete this.interval_id;
	});

	this.search = function(text) {
		var $res = $("#menu-search ul");
		$res.empty();
		text = text.toLowerCase();
		function cmp(v) {
			var name = v.node.name;
			var index = name.toLowerCase().indexOf(text);
			if(index != -1) {
				var s = name.substr(0, index) +
						"<b>" + name.substr(index, text.length) +
						"</b>" + name.substr(index + text.length)
				$("<li>")
					.addClass("sidemenu-result")
					.html(s)
					.click(function() {
						viewer.centerize(v, 500);
					})
					.appendTo($res);
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
	this.search("");

	//--------------------------------------------------------
	var $export = $("#menu-export-i")
			.click(function(e) {
				self.show("#menu-export");
			})
			.appendTo(root);

	$("#menu-export-json").click(function() {
		self.actExportJson();
	});

	$("#menu-export-png").click(function() {
		self.actExportPng();
	});

	//--------------------------------------------------------
	var $info = $("#menu-info-i")
			.click(function(e) {
				self.show("#menu-info");
			})
			.appendTo(root);
	
	(function() {
		var types = DNode.getTypes();
		var count = {};
		for(var i=0; i<types.length; i++) {
			count[types[i]] = 0;
		}
		viewer.traverseAll(function(node) {
			count[node.type] += 1;
		});
		var $table = $("#menu-info-table");
		for(var i=0; i<types.length; i++) {
			var name = types[i];
			$("<tr></tr>")
				.append($("<td></td>").html(name))
				.append($("<td></td>").html(count[name]))
				.appendTo($table);
		}
	})();

	//--------------------------------------------------------
	var $tool = $("#menu-tool-i")
			.click(function(e) {
				self.show("#menu-tool");
			})
			.appendTo(root);

	$("#menu-tool-commit").click(function() {
		self.actCommit();
	});

}

