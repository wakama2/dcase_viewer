var SideMenu = function(root, viewer) {
	var width = 250;
	var animeTime = 250;
	var self = this;

	$(root).addClass("sidemenu").css({
		left: "0px", top: "0px", display: "none"
	});

	$(root).append($("<input></input>").attr({
		type: "button", value: "close"
	}).click(function() {
		self.close()
	}));
	
	$(root).append($("<input></input>").attr({
		type: "button", value: "lock",
	}).click(function() {
		var flag = !viewer.getDragLock();
		viewer.setDragLock(flag);
		this.value = flag ? "lock" : "unlock";
		viewer.setTextSelectable(!flag);
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "edit",
	}).click(function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			var node = view.node;
			new DNodeEditWindow(viewer, node, function() {
				viewer.setModel(viewer.model);
				var r = callAPI("update", {
					argument_id: viewer.opts.argument_id,
					node_id: node.id,
					description: node.text
				});
			});
		}
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "insert",
	}).click(function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			var newNode = new DNode(0, "", "Goal", "");
			new DNodeEditWindow(viewer, newNode, function() {
				view.node.addChild(newNode);
				viewer.setModel(viewer.model);
				var r = callAPI("insert", {
					new: {
						type: newNode.type,
						description: newNode.text,
					},
					argument_id: viewer.opt.argument_id,
					parent: {
						args_id: viewer.opt.argument_id,
						node_id: view.node.id,
					}
				});
				newNode.id = JSON.parse(r).result.node_id;
			});
		}
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "remove",
	}).click(function() {
		var view = viewer.getSelectedNode();
		if(view != null) {
			if(confirm("ノードを削除しますか？")) {
				var ps = view.node.parents;
				if(ps.length > 0) {
					var p = ps[0];
					var n = p.children.indexOf(view.node);
					p.children.splice(n, 1);
					viewer.setModel(viewer.model);

					var r = callAPI("delete", {
						argument_id: viewer.opt.argument_id,
						node_id: view.node.id,
					});
				}
			}
		}
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "export json",
	}).click(function() {
		//TODO
		alert("TODO");
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "export png",
	}).click(function() {
		//TODO
		alert("TODO");
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "reload",
	}).click(function() {
		viewer.setModel(viewer.model);
	}));

	$(root).append($("<input></input>").attr({
		type: "button", value: "commit",
	}).click(function() {
		var msg = prompt("コミットメッセージを入力して下さい");
		if(msg != null) {
			callAPI("commit", {
				message: msg
			});
		}
	}));

	$(root).append($("<input></input>").addClass("sidemenu-search-text").attr({
		type: "text", value: "",
	}).focus(function(e) {
		var area = this;
		this.interval_id = setInterval(function() {
			self.search_inc(area.value);
		}, 1000/5);
	}).blur(function(e) {
		clearInterval(this.interval_id);
		delete this.interval_id;
	}));

	var searchResult = $("<ul></ul>").addClass("sidemenu-search-result");
	searchResult.height($(root).height() - searchResult.css("top") - 16);
	$(root).append(searchResult);

	this.divgrip = $("<div></div>").addClass("sidemenu-grip").css({
		left: "0px", top: "0px", display: "block", zIndex: 20,
	}).click(function(e) {
		self.open();
	}).bind("touchstart", function(e) {
		self.open();
	});
	$(document.body).append(this.divgrip);//FIXME

	this.close = function() {
		self.divgrip.css("display", "block");
		var begin = new Date();
		var id = setInterval(function() {
			var time = new Date() - begin;
			var r = time / animeTime;
			if(r < 1.0) {
				$(root).css("left", Math.round(-width * r) + "px");
			} else {
				$(root).css({ left: "0px", display: "none" });
				clearInterval(id);
			}
		}, 1000/60);
	}

	this.search = function(text) {
		searchResult.empty();
		text = text.toLowerCase();
		function cmp(v) {
			var name = v.node.name;
			var index = name.toLowerCase().indexOf(text);
			if(index != -1) {
				searchResult.append($("<li>").addClass("sidemenu-result").html(
						name.substr(0, index) +
						"<b>" + name.substr(index, text.length) +
						"</b>" + name.substr(index + text.length)
				).click(function() {
					viewer.centerize(v);
				}));
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

	this.open = function() {
		$(root).css("display", "block");
		self.divgrip.css("display", "none");
		var begin = new Date();
		var id = setInterval(function() {
			var time = new Date() - begin;
			var r = time / animeTime;
			if(r < 1.0) {
				$(root).css("left", Math.round(- width * (1.0 - r)) + "px");
			} else {
				$(root).css("left", "0px");
				clearInterval(id);
			}
		}, 1000/60);
	}

	// init search list
	this.search("");
}

