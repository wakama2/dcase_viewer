/* class DNode */
var DNode = (function() {
    function DNode(id, name, type, text) {
        this.id = id;
        this.name = name;
        this.text = text;
        this.type = type;
        this.children = [];
        this.context = null;
        this.parents = [];
        this.prevVersion = null;
        this.nextVersion = null;
    }
    DNode.prototype.addChild = function(node) {
        if (node.type != 'Context') {
            this.children.push(node);
        } else {
            this.context = node;
        }
        node.parents.push(this);
    };

    DNode.prototype.removeChild = function(node) {
        if (this.context == node) {
            this.context = null;
        } else {
            var n = this.children.indexOf(node);
            this.children.splice(n, 1);
        }
    };

    DNode.prototype.isArgument = function() {
        return this.context != null && this.type == 'Goal';
    };

    DNode.prototype.isUndevelop = function() {
        return this.children.length == 0 && this.type == 'Goal';
    };

    DNode.prototype.getTypes = function() {
        return [
            'Goal', 'Context', 'Strategy', 'Evidence', 'Monitor',
            'DScriptContext', 'DScriptEvidence', 'Rebuttal'
        ];
    };

    //-------------------------------------
    DNode.prototype.isDScript = function() {
        return this.type == 'DScriptEvidence';
    };
    return DNode;
})();

//-------------------------------------
function createNodeFromURL(url) {
    var a = $.ajax({
        url: url,
        type: 'GET',
        async: false,
        dataType: 'json'
    });
    return createNodeFromJson(JSON.parse(a.responseText));
}

function contextParams(params) {
    var s = '';
    for (key in params) {
        s += '@' + key + ' : ' + params[key] + '\n';
    }
    return s;
}

function createNodeFromJson(json) {
    var nodes = new Object();
    for (var i = 0; i < json.Tree.NodeList.length; i++) {
        var c = json.Tree.NodeList[i];
        nodes[String(c.ThisNodeId)] = c;
    }
    function createChildren(node, l) {
        for (var i = 0; i < l.Children.length; i++) {
            var child = l.Children[i];
            var n = nodes[String(child.ThisNodeId)];
            n.Name = n.NodeType.charAt(0) + n.ThisNodeId;
            var desc = n.Description ? n.Description : contextParams(n.Properties);
            var newNode = new DNode(n.ThisNodeId, n.Name, n.NodeType, desc);
            node.addChild(newNode);
            createChildren(newNode, child);
        }
    }
    var n = nodes[String(json.Tree.TopGoalId)];
    var topNode = new DNode(0, 'TopGoal', n.NodeType, n.Description);
    createChildren(topNode, n);
    return topNode;
}

function createBinNode(n) {
    if (n > 0) {
        var node = new DNode(0, 'Goal', 'Goal', 'description');
        node.addChild(createBinNode(n - 1));
        node.addChild(createBinNode(n - 1));
        return node;
    } else {
        return new DNode(0, 'Goal', 'Goal', 'description');
    }
}

var id_count = 1; // ?

function initViewer(id) {
    var node = getNodeFromServer(id);
    var opts = {
        argument_id: id
    };
    console.log(node);
    DCase_Viewer.setModel(node);
    console.log(DCase_Viewer.rootview);
}
