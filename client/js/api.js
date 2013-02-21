var DCaseAPIModule = (function() {
    function DCaseAPI(url) {
        this.cgi = url;
    }
    DCaseAPI.prototype.insert_queue = {command: "insert", NodeList: []};
    DCaseAPI.prototype.replace_queue = {command: "replace", NodeList: []};
    DCaseAPI.prototype.delete_queue = {command: "delete", NodeList: []};

    DCaseAPI.prototype.call = function(method, params) {
        var cmd = {
            jsonrpc: '2.0',
            method: method,
            version: '1.0',
            params: params
        };
        var res = $.ajax({
            type: 'POST',
            url: this.cgi,
            async: false,
            data: JSON.stringify(cmd),
            dataType: 'json',
            error: function(req, stat, err) {
                //alert(stat);
            }
        });
        var resText = res.responseText;
        resText = resText.replace(/\n/g, ' \\n ');
        resText = resText.replace(/\t/g, '');
        try {
            var jres = JSON.parse(resText);
            return jres.result;
        } catch (e) {
        }
    };

    DCaseAPI.prototype.get = function(filter, id) {
        return this.call('get', { filter: filter, argument_id: id });
    };

    DCaseAPI.prototype.update = function(node) {
        this.replace_queue.NodeList.push(node);
        //return this.call('update', args);
    };

    DCaseAPI.prototype.insert = function(node) {
        this.insert_queue.NodeList.push(node);
        //return this.call('insert', args);
    };

    DCaseAPI.prototype.del = function(node) {
        this.delete_queue.NodeList.push(node);
        //return this.call('delete', args);
    };

    DCaseAPI.prototype.commit = function(msg, argument_id) {
        console.log(argument_id);
        var commitObj = [this.replace_queue, this.insert_queue,this.delete_queue];
        var r = this.call('Commit', { message: msg, BelongedArgumentId: argument_id, commit: commitObj }); //TODO ProcessId
        this.insert_queue = {command: "insert", NodeList: []};
        this.replace_queue = {command: "replace", NodeList: []};
        this.delete_queue = {command: "delete", NodeList: []};
        return r;
    };

    DCaseAPI.prototype.search = function(args) {
        return this.call('FindNodeByDescription', args);
    };

    return DCaseAPI;
})();

var DCaseAPI = new DCaseAPIModule(CONFIG.cgi_url);
