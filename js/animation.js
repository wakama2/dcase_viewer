var Animation = function() {
	var moveList = [];
	var fadeInList = [];
	var fadeOutList = [];

	function getAttrSetter(dom) {
		if(dom.setAttribute != null) {//FIXME?
			return {
				set: function(key, value) { dom.setAttribute(key, value); },
				get: function(key) { return dom.getAttribute(key); }
			};
		} else {
			return {
				set: function(key, value) { dom.css(key, value); },
				get: function(key) { return dom.css(key); }
			};
		}
	}

	this.move = function(dom, key, toValue) {
		var mtd = getAttrSetter(dom);
		var fromValue = parseInt(mtd.get(key));
		moveList.push({
			key: key,
			from: fromValue,
			to: parseInt(toValue),
			set: mtd.set
		});
		return this;
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
		$.each(fadeInList, function(i, e) {
			e("opacity", 1.0);
		});
		$.each(fadeOutList, function(i, e) {
			e("opacity", 1.0);
			e("display", "none");
		});
	}

}

