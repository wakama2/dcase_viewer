var Animation = function() {
	var moveList = [];
	var movepList = [];
	var fadeInList = [];
	var fadeOutList = [];

	function getAttrSetter(dom) {
		if(dom.setAttribute != null) {//FIXME?
			return {
				set: function(key, value) { dom.setAttribute(key, value); },
				get: function(key) { return dom.getAttribute(key); }
			};
		} else if(dom.css != undefined){
			return {
				set: function(key, value) { dom.css(key, value); },
				get: function(key) { return dom.css(key); }
			};
		} else {
			return {
				set: function(key, value) { dom[key] = value; },
				get: function(key) { return dom[key]; }
			};
		}
	}

	this.move = function(dom, key, toValue) {
		var mtd = getAttrSetter(dom);
		var fromValue = parseInt(mtd.get(key));
		toValue = Math.floor(toValue);
		if(fromValue != toValue) {
			moveList.push({
				key: key,
				from: fromValue,
				to: toValue,
				set: mtd.set
			});
		}
		return this;
	}

	this.moves = function(dom, json) {
		for(var key in json) {
			this.move(dom, key, json[key]);
		}
		return this;
	}

	function makePoints(points) {
		var s = "";
		for(var i=0; i<points.length; i++) {
			if(i != 0) s += " ";
			s += Math.floor(points[i].x) + "," + Math.floor(points[i].y);
		}
		return s;
	}

	this.movePolygon = function(dom, points) {
		var from = [];
		for(var i=0; i<dom.points.numberOfItems; i++) {
			var p = dom.points.getItem(i);
			from.push({ x: p.x, y: p.y });
		}
		movepList.push({
			dom: dom,
			from: from,
			to: points,
		});
	}

	this.show = function(dom, visible) {
		var mtd = getAttrSetter(dom);
		var disp = mtd.get("display");
		if(disp == null) {
			mtd.set("display", visible ? "block" : "none");
		} else if(disp == "none" && visible) {
			// fade in
			fadeInList.push(mtd.set);
			mtd.set("opacity", 0.0);
			mtd.set("display", "block");
		} else if(disp == "block" && !visible) {
			// fade out
			fadeOutList.push(mtd.set);
			mtd.set("opacity", 1.0);
			mtd.set("display", "block");
		}
		return this;
	}

	this.anime = function(r) {
		$.each(moveList, function(i, e) {
			e.set(e.key, e.from + (e.to - e.from) * r);
		});
		$.each(movepList, function(i, e) {
			var p = [];
			for(var i=0; i<e.to.length; i++) {
				p.push({
					x: e.from[i].x + (e.to[i].x - e.from[i].x) * r,
					y: e.from[i].y + (e.to[i].y - e.from[i].y) * r
				});
			}
			e.dom.setAttribute("points", makePoints(p));
		});
		$.each(fadeInList, function(i, e) {
			e("opacity", r);
		});
		$.each(fadeOutList, function(i, e) {
			e("opacity", 1.0 - r);
		});
	}

	this.animeFinish = function() {
		$.each(moveList, function(i, e) {
			e.set(e.key, e.to);
		});
		$.each(movepList, function(i, e) {
			e.dom.setAttribute("points", makePoints(e.to));
		});
		$.each(fadeInList, function(i, e) {
			e("opacity", 1.0);
		});
		$.each(fadeOutList, function(i, e) {
			e("opacity", 1.0);
			e("display", "none");
		});
	}
}

