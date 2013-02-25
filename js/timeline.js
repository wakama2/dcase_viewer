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

	this.argument = viewer.getArgument();

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

	var selected = null;
	var graphWidth = 0;
	var MX = 20;
	var MY = 20;

	this.drag = function() {
		$container.css("left", scroll + dragX);
		$canvas.attr("left", scroll + dragX);
		$canvas.css("left", scroll + dragX);
	};

	function addCommitMark(x, y, commitId) {
		var d = $("<div></div>").css({
			left: x, top: y, width: MX, height: MY,
		}).addClass("timeline-commit").click(function() {
			var argId = self.argument.argId;
			var arg = DCaseAPI.getArgument(argId, commitId);
			viewer.setArgument(arg);
			if(selected != null) {
				selected.css("border-color", "");
				selected = d;
				d.css("border-color", "orange");
			}
			console.log("arguemnt " + commitId);
		}).appendTo($container)
		console.log(commitId + ", " + self.argument.commitId);
		if(commitId == self.argument.commitId) {
			d.css("border-color", "orange");
			selected = d;
		}
	}

	function put(ctx, mm, x, y, id) {
		addCommitMark(x, y, id);
		graphWidth = Math.max(graphWidth, x);
		var c = mm[id];
		if(c != null) {
			var NX = 50;
			var NY = 30;
			var y0 = y;
			y = put(ctx, mm, x+NX, y, c[0]);
			ctx.moveTo(x+MX/2   , y0+MY/2);
			ctx.lineTo(x+MX/2+NX, y0+MY/2);
			for(var i=1; i<c.length; i++) {
				y = put(ctx, mm, x+NX, y+NY, c[i]);
				ctx.moveTo(x+MX/2   , y0+MY/2);
				ctx.lineTo(x+MX/2   , y +MY/2);
				ctx.lineTo(x+MX/2+NX, y +MY/2);
			}
		}
		return y;
	}

	this.repaint = function() {
		var arg = viewer.getArgument();
		self.argument = arg;
		$container.empty();

		if(arg == null) return;

		var mm = {};
		var l = arg.getCommitList();
		for(var i=0; i<l.length-1; i++) {
			var x = mm[l[i]];
			if(x == null) x = [];
			if(x.indexOf(l[i+1]) == -1) x.push(l[i + 1]);
			mm[l[i]] = x;
		}

		$.each(DCaseAPI.getBranchList(arg.argId), function(i, br) {
			if(br != arg.commitId) {
				var l = DCaseAPI.call("getCommitList", { commitId: br }).commitIdList;
				for(var i=0; i<l.length-1; i++) {
					var x = mm[l[i]];
					if(x == null) x = [];
					if(x.indexOf(l[i+1]) == -1) x.push(l[i + 1]);
					mm[l[i]] = x;
				}
			}
		});
		graphWidth = 0;
		selected = null;

		var ctx = $canvas[0].getContext("2d");
		ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
		ctx.beginPath();
		var y = put(ctx, mm, 0, 0, l[0]);
		ctx.stroke();
		$timeline.height(y + 30);
		//$canvas.css("height", y + 30);
		//$canvas.attr("height", y + 30);
		graphWidth += 24;

		scroll = ($timeline.width() - graphWidth) / 2;
		self.drag();
	};
};

