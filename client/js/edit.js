var DNodeEditWindow = (function() {
    function DNodeEditWindow() {
        this.onSuccess = function(node) {};
        this.node = null;
    }

    DNodeEditWindow.init = function(parent) {
        var $select = $('#edit select');
        var $desc = $('#edit textarea');
        var self = this;
        $select.children().remove();
        var children = DNode[parent.type].children;
        for (var i = 0; i < children.length; i++) {
            var type = children[i].name;
            $('<option></option>')
                .attr('id', 'edit-option-' + type)
                .html(type)
                .appendTo($select);
        }
        $('#edit').css({
            left: ($(document).width() - $('#edit').width()) / 2,
            top: ($(document).height() - $('#edit').height()) / 2
        });
        /* FIXME(ide) adhoc fix*/
        $('#edit-ok').unbind();
        $('#edit-cancel').unbind();

        $('#edit-ok').click(function() {
            self.applyAndClose();
        });
        $('#edit-cancel').click(function() {
            self.close();
        });

        function CollectNodeDescript(list, node) {
            list.push(node.text);
            for (var i=0; i < node.children.length; i++) {
                CollectNodeDescript(list, node.children[i]);
            };
        }
        var desc_list = [];
        CollectNodeDescript(desc_list, DCase_Viewer.rootview.node);
        $desc.autocomplete({list : desc_list});
    }

    DNodeEditWindow.applyAndClose = function() {
        var node = this.node;
        var $desc = $('#edit textarea');
        if (node != null) {
            node.text = $desc.attr('value');
        } else {
            var selected = $('#edit select option:selected').text();
            node = new DNode(-1, 'NewNode', selected, $desc.attr('value'));
        }
        this.close();
        this.onSuccess(node);
    };

    DNodeEditWindow.close = function() {
        $('#edit').hide();
    };

    DNodeEditWindow.open = function(node, parent, onSuccess) {
        this.onSuccess = onSuccess;
        this.node = node;
        this.init(parent);
        var selectedType = DNode.NODE_TYPES[0];
        var $select = $('#edit select');
        var $desc = $('#edit textarea');
        if (node != null) {
            selectedType = node.type;
            $select.attr('disabled', true);
            $desc.attr('value', node.text);
        } else {
            $select.attr('disabled', false);
            $desc.attr('value', '');
        }
        $('edit-option-' + selectedType).attr('selected', true);

        $("#edit").mousedown(function(e){
            $("#edit")
                .data("clickPointX" , e.pageX - $("#edit").offset().left)
                .data("clickPointY" , e.pageY - $("#edit").offset().top);

            $(document).mousemove(function(e){
                $("#edit").css({
                    top: e.pageY  - $("#edit").data("clickPointY")+"px",
                    left: e.pageX - $("#edit").data("clickPointX")+"px"
                })
            })

        }).mouseup(function(){
            $(document).unbind("mousemove")
        });

        $('#edit').show();
    };
    return DNodeEditWindow;
}());
