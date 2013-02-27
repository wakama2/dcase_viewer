var DCaseAPI = new Object();

DCaseAPI.cgi = "cgi/api.cgi";

DCaseAPI.call = function(method, params) {
	var cmd = {
		jsonrpc: "2.0",
		method: method,
		version: "1.0",
		params: params
	};
	var res = $.ajax({
		type: "POST",
		url: DCaseAPI.cgi,
		async: false,
		data: JSON.stringify(cmd),
		dataType: "json",
		error: function(req, stat, err) {
			//alert(stat);
		}
	});
	//var resText = res.responseText.replace(/\n/g, " \\n ").replace(/\t/g, "");
	try {
		//var jres = JSON.parse(resText);
		var jres = JSON.parse(res.responseText);
		return jres.result;
	} catch(e) {
		console.log("json parse error!");
	}
}

//-------------------------------------

DCaseAPI.getArgumentList = function() {
	return this.call("getArgumentList", {}).argumentIdList;
};

DCaseAPI.getBranchList = function(arg) {
	return this.call("getBranchList", { argumentId: arg }).commitIdList;
};

DCaseAPI.getArgument = function(argId, commitId) {
	var r = this.call("getNodeTree", { commitId: commitId });
	return new Argument(this.createNode(r.tree), argId, commitId);
};

DCaseAPI.createArgument = function(newNode) {
	var r = this.call("createTopGoal", {
		tree: {
			NodeList: [{
				ThisNodeId: newNode.id,
				NodeType: newNode.type,
				Description: newNode.desc,
				Children: [],
			}],
			TopGoalId: newNode.id,
		}
	});
	return new Argument(newNode, r.argmentId, r.commitId);
};

function contextParams(params) {
	var s = "";
	for(key in params) {
		s += "@" + key + " : " + params[key] + "\n";
	}
	return s;
}

DCaseAPI.createNode = function(tree) {
	var nodes = [];
	for(var i=0; i<tree.NodeList.length; i++) {
		var c = tree.NodeList[i];
		nodes[c.ThisNodeId] = c;
	}
	var counts = {};
	var types = DNode.TYPES;
	for(var i=0; i<types.length; i++) {
		counts[types[i]] = 1;
	}
	function create(id) {
		var data = nodes[id];
		var type = data.NodeType;
		var name = type[0] + (counts[type]++);
		var desc = data.Description;
		var node = new DNode(id, name, type, desc);
		for(var i=0; i<data.Children.length; i++) {
			node.addChild(create(data.Children[i]));
		}
		return node;
	}
	var topId = tree.TopGoalId;
	return create(topId);
}

DCaseAPI.search = function(text) {
	return this.call("search", {text: text});
}

