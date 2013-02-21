var DNodeEditWindow = (function() {
    var self = this;
    var $select;
    var $desc;
    var selectedType = null;
    var success = null;
    var node = null;

    function init() {
        $select = $('#edit select');
        $desc = $('#edit textarea');
        $select.children().remove();
        var children = DNode[parent.type].children;
            console.log(parent.type);
        for (var i=0; i < children.length; i++) {
            var type = children[i].name;
            console.log(i);
            console.log(children[i]);
            $('<option></option>')
                .attr('id', 'edit-option-' + type)
                .html(type)
                .appendTo($select);
        }
        $('#edit').css({
            left: ($(document).width() - $('#edit').width()) / 2,
            top: ($(document).height() - $('#edit').height()) / 2
        });
        $('#edit-ok').click(function() {
            DNodeEditWindow.applyAndClose();
        });
        $('#edit-cancel').click(function() {
            DNodeEditWindow.close();
        });
        $select.change(function() {
            $('select option:selected').each(function() {
                selectedType = this.text;
            });
        });
    }

    this.applyAndClose = function() {
        var node = self.node;
        if (node != null) {
            node.text = $desc.attr('value');
        } else {
            node = new DNode(-1, 'NewNode', selectedType, $desc.attr('value'));
        }
        self.close();
        self.success(node);
    };

    this.close = function() {
        $('#edit').hide();
    };

    this.open = function(node, parent, success) {
        self.success = success;
        self.node = node;
        self.parent = parent;
        init();
        if (node != null) {
            selectedType = node.type;
            $select.attr('disabled', true);
            $desc.attr('value', node.text);
        } else {
            selectedType = DNode.NODE_TYPES[0];
            $select.attr('disabled', false);
            $desc.attr('value', '');
        }
        $('edit-option-' + selectedType).attr('selected', true);
        $('#edit').show();
    };

    return this;
}());
