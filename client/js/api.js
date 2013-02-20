var DCaseAPIModule = (function() {
    function DCaseAPI(url) {
        this.cgi = url;
    }
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

    DCaseAPI.prototype.update = function(args) {
        return this.call('update', args);
    };

    DCaseAPI.prototype.insert = function(args) {
        return this.call('insert', args);
    };

    DCaseAPI.prototype.del = function(args) {
        return this.call('delete', args);
    };

    DCaseAPI.prototype.commit = function(msg) {
        return this.call('commit', { message: msg });
    };

    DCaseAPI.prototype.search = function(args) {
        return this.call('FindNodeByDescription', args);
    };

    return DCaseAPI;
})();

var DCaseAPI = new DCaseAPIModule(CONFIG.cgi_url);
