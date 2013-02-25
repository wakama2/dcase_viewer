var TimeLine = function(root, viewer) {
	var self = this;

	var $timeline = $("<div></div>")
		.addClass("timeline")
		.appendTo(root);
	var $canvas = $("<canvas></canvas>")
		.css("position", "absolute")
		.appendTo($timeline);
	var $container = $("<div></div>").css({
		position: "absolute", left: 0, top: 0,
	}).appendTo($timeline);

	//--------------------------------------------------------

	var scroll = 0;
	var mouseX = null;
	var dragX = 0;

	$timeline.mousedown(function(e) {
		mouseX = e.pageX;
	});

	$timeline.mousemove(function(e) {
		if(mouseX != null) {
			dragX = e.pageX - mouseX;
			self.drag();
		}
	});

	$timeline.mouseup(function(e) {
		scroll += dragX;
		dragX = 0;
		mouseX = null;
		self.drag();
	});

	//--------------------------------------------------------

	this.drag = function() {
		$container.css("left", scroll + dragX);
		$canvas.attr("left", scroll + dragX);
		$canvas.css("left", scroll + dragX);
	};

	function put(x, y, commitId) {
		$("<div></div>").css({
			left: x, top: y,
		}).addClass("timeline-commit").click(function() {
			console.log("arguemnt " + commitId);
			var arg = DCaseAPI.getArgument(commitId);
			viewer.setArgument(arg);
		}).appendTo($container)
	}

	var wid = 0;

	function puts(ctx, mm, x, y, id) {
		put(x, y, id);
		wid = Math.max(wid, x);
		var c = mm[id];
		if(c != null) {
			var y0 = y;
			y = puts(ctx, mm, x+50, y, c[0]);
			ctx.beginPath();
			ctx.moveTo(x+12, y0+12);
			ctx.lineTo(x+62, y0+12);
			ctx.stroke();
			for(var i=1; i<c.length; i++) {
				y = puts(ctx, mm, x+50, y+30, c[1]);
				ctx.beginPath();
				ctx.moveTo(x+12, y0+12);
				ctx.lineTo(x+12, y+12);
				ctx.lineTo(x+62, y+12);
				ctx.stroke();
			}
		}
		return y;
	}

	var argId0 = null;

	this.repaint = function(argId, brId) {
		var arg = viewer.getArgument();
		if(arg == null) return;
		if(argId == null) argId = argId0;
		if(argId == null) return;
		argId0 = argId;
		if(brId == null) brId = arg.commitId;

		$container.empty();

		var mm = {};

		var l = arg.getCommitList();
		for(var i=0; i<l.length-1; i++) {
			var x = mm[l[i]];
			if(x == null) x = [];
			if(x.indexOf(l[i+1]) == -1) x.push(l[i + 1]);
			mm[l[i]] = x;
		}

		$.each(DCaseAPI.getBranchList(argId), function(i, br) {
			if(br != brId) {
				var l = DCaseAPI.call("getCommitList", { commitId: br }).commitIdList;
				for(var i=0; i<l.length-1; i++) {
					var x = mm[l[i]];
					if(x == null) x = [];
					if(x.indexOf(l[i+1]) == -1) x.push(l[i + 1]);
					mm[l[i]] = x;
				}
			}
		});

		wid = 0;
		var ctx = $canvas[0].getContext("2d");
		ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
		var y = puts(ctx, mm, 0, 0, l[0]);
		console.log(y);
		$timeline.height(y + 30);
		wid += 24;

		scroll = ($timeline.width() - wid) / 2;
		console.log(scroll);
		self.drag();
	};

	this.repaint();
};

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
			var parent = view.node.parents;
			if(parent.length > 0) {
				if(confirm("ノードを削除しますか？")) {
					var op = new RemoveOperation(parent, view.node);
					viewer.getArgument().applyOperation(op);
					viewer.structureUpdated();
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
	//this.search("");

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

	function updateArgumentList() {
		var $res = $("#menu-proc ul");
		$res.empty();
		$.each(DCaseAPI.getArgumentList(), function(i, arg) {
			$.each(DCaseAPI.getBranchList(arg), function(i, br) {
				$("<li>")
					.addClass("sidemenu-result")
					.html(br)
					.click(function() {
						viewer.setArgument(DCaseAPI.getArgument(br));
						timeline.repaint(arg, br);
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
		viewer.getArgument().undo();
		viewer.structureUpdated();
	});

	$("#menu-proc-redo").click(function() {
		viewer.getArgument().redo();
		viewer.structureUpdated();
	});

	$("#menu-proc-newarg").click(function() {
		DNodeEditWindow.open(null, ["Goal"], function(newNode) {
			viewer.setArgument(DCaseAPI.createArgument(newNode));
			timeline.repaint();
			updateArgumentList();
		});
	});

}


