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
      console.log(viewer);
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
			"#menu-create",
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

	$("#menu-search input").blur(function(e) {
		clearInterval(this.interval_id);
		delete this.interval_id;
	}).keydown(function (e) {
		if (e.keyCode == 13) { // Enter key
			var i = this;
			var r = DCaseAPI.search({
				SearchText: i.value
			});
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
	var $create = $("#menu-create-i")
			.click(function(e) {
				console.log('hello');
				self.show("#menu-create");
			})
			.appendTo(root);
	$('#menu-create-argument').click(function(e) {
		// create new Argument
		var cmtr = $('#argument_committer').val();
		var desc = $('#argument_description').val();
		//var r = DCaseAPI.call("CreateTopGoal", {"Committer": cmtr, "ProcessType": 1, "Description": desc, "Justification": "first commit"});
		//console.log(r);
		//init_viewer(1);
	});

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


