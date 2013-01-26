var DCaseAPI = new Object();

DCaseAPI.cgi = "cgi/interface.cgi";

DCaseAPI.call = function(method, params) {
	var cmd = {
		jsonproc: "2.0",
		method: method,
		version: "1",
		params: params
	};
	var res = $.ajax({
		type: "POST",
		url: DCaseAPI.cgi,
		async: false,
		data: JSON.stringify(cmd),
		dataType: "json",
		error: function(req, stat, err) {
			alert(stat);
		}
	});
	console.log(res.responseText);
	try {
		var jres = JSON.parse(res.responseText);
		return jres.result;
	} catch(e) {
	}
}

DCaseAPI.get = function(filter, id) {
	return this.call("get", { filter: filter, argument_id: id });
}

DCaseAPI.update = function(args) {
	return this.call("update", args);
}

DCaseAPI.insert = function(args) {
	return this.call("insert", args);
}

DCaseAPI.del = function(args) {
	return this.call("delete", args);
}

DCaseAPI.commit = function(msg) {
	return this.call("commit", { message: msg });
}

