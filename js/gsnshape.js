var GsnShape = {
	"Goal": (function() {
		var N = 10;
		var Goal = function($svg) {
			this.elems = [ $svg.createSvg("rect") ];
		};
		Goal.prototype.animate = function(a, x, y, w, h, scale) {
			a.moves(this.elems[0], {
				x: x, y: y, width : w, height: h,
			});
			return { x: N, y: N };//offset
		};
		Goal.prototype.outer = function(w, h) {
			return { w: w + N*2, h: h + N*2 };
		};
		return Goal;
	}()),
	"Context": (function() {
		var N = 10;
		var Context = function($svg) {
			this.elems = [ $svg.createSvg("rect") ];
		};
		Context.prototype.animate = function(a, x, y, w, h, scale) {
			a.moves(this.elems[0], {
				rx: N * scale, ry: N * scale,
				x : x, y : y, width : w, height: h
			});
			return { x: N, y: N };
		};
		Context.prototype.outer = function(w, h) {
			return { w: w + N, h: h + N };
		};
		return Context;
	}()),
	"Subject": (function() {
		var N = 20;
		var Subject = function($svg) {
			this.elems = [
				$svg.createSvg("g"),
				$svg.createSvg("rect"),
				$svg.createSvg("polygon"),
			];
			$(this.elems[2]).attr("fill", "gray");
			this.elems[0].appendChild(this.elems[1]);
			this.elems[0].appendChild(this.elems[2]);
		};
		Subject.prototype.animate = function(a, x, y, w, h, scale) {
			var n = N * scale;
			a.moves(this.elems[1], {
				rx: n, ry: n, x : x, y : y, width : w, height: h
			});
			a.movePolygon(this.elems[2], [
				{ x: x+w*5/8, y:y-n },
				{ x: x+w*5/8, y:y+n },
				{ x: x+w*5/8+n*2, y:y },
			]);
			return  { x: n/2, y: n/2 };
		};
		Subject.prototype.outer = function(w, h) {
			return { w: w + N, h: h + N };
		};
		return Subject;
	}()),
	"Strategy": (function() {
		var N = 20;
		var Strategy = function($svg) {
			this.elems = [ $svg.createSvg("polygon") ];
		};
		Strategy.prototype.animate = function(a, x, y, w, h, scale) {
			var n = N * scale;
			a.movePolygon(this.elems[0], [
				{ x: x+n, y: y },
				{ x: x+w, y: y },
				{ x: x+w-n, y: y+h },
				{ x: x, y: y+h }
			]);
			return { x: N * 1.5, y: N / 2 };
		};
		Strategy.prototype.outer = function(w, h) {
			return { w: w + N*2, h: h + N };
		};
		return Strategy;
	}()),
	"Evidence": (function() {
		var Evidence = function($svg) {
			this.elems = [ $svg.createSvg("ellipse") ];
		};
		Evidence.prototype.animate = function(a, x, y, w, h, scale) {
			a.moves(this.elems[0], {
				cx: x + w/2, cy: y + h/2,
				rx: w/2, ry: h/2,
			});
			return { x: w/6/scale, y: h/6/scale };
		};
		Evidence.prototype.outer = function(w, h) {
			return { w: w*8/6, h: h*8/6 };
		};
		return Evidence;
	}()),
	"Solution": (function() {
		var N = 20;
		var Solution = function($svg) {
			this.elems = [
				$svg.createSvg("g"),
				$svg.createSvg("ellipse"),
				$svg.createSvg("polygon"),
			];
			$(this.elems[2]).attr("fill", "gray");
			this.elems[0].appendChild(this.elems[1]);
			this.elems[0].appendChild(this.elems[2]);
		};
		Solution.prototype.animate = function(a, x, y, w, h, scale) {
			a.moves(this.elems[1], {
				cx: x + w/2, cy: y + h/2,
				rx: w/2, ry: h/2,
			});
			var n = N * scale;
			a.movePolygon(this.elems[2], [
				{ x: x+w*5/8, y:y-n },
				{ x: x+w*5/8, y:y+n },
				{ x: x+w*5/8+n*2, y:y },
			]);
			return { x: w/6/scale, y: h/6/scale };
		};
		Solution.prototype.outer = function(w, h) {
			return { w: w*8/6, h: h*8/6 };
		};
		return Solution;
	}()),
};

GsnShape["Rebuttal"] = GsnShape["Evidence"];

