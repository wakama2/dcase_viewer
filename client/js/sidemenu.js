var SideMenu = (function(root, viewer) {
    var width = 200;
    var animeTime = 250;
    var self = this;

    //--------------------------------------------------------
    this.actChangeLock = function() {
        var flag = !viewer.getDragLock();
        viewer.setDragLock(flag);
        this.value = flag ? 'lock' : 'unlock';
        viewer.setTextSelectable(!flag);
    };

    this.actEditSelectedNode = function() {
        var view = viewer.getSelectedNode();
        if (view != null) {
            DNodeEditWindow.open(view.node, view.node, function(node) {
                viewer.setModel(viewer.model);
                var r = DCaseAPI.update({
                    argument_id: viewer.opts.argument_id,
                    node_id: node.id,
                    description: node.text
                });
            });
        }
    };

    this.actInsertToSelectedNode = function() {
        console.log(viewer.tmp_id);
        var view = viewer.getSelectedNode();
        if (view != null) {
            DNodeEditWindow.open(null, view.node, function(newNode) {
                view.node.addChild(newNode);
                viewer.setModel(viewer.model);
                DCaseAPI.insert({
                        NodeType: newNode.type,
                        ThisNodeId: viewer.tmp_id,
                        Description: newNode.text,
                        BelongedArgumentId: viewer.opts.argument_id,
                        ParentNodeId: view.node.id,
                        Children: []
                });
            });
            viewer.tmp_id -= 1;
        }
    };

    this.actRemoveSelectedNode = function() {
        var view = viewer.getSelectedNode();
        if (view != null) {
            if (confirm('ノードを削除しますか？')) {
                var parent = view.node.parents;
                if (parent.length > 0) {
                    parent[0].removeChild(view.node);
                    viewer.setModel(viewer.model);
                    DCaseAPI.del({
                        BelongedArgumentId: viewer.opts.argument_id,
                        NodeId: view.node.id
                    });
                }
            }
        }
    };

    this.actExportJson = function() {
        var view = viewer.getSelectedNode();
        console.log(view);
    };

    this.actExportPng = function() {
        DumpTree('png');
    };

    this.actExportScript = function() {
        DumpTree('dscript');
    };

    this.actCommit = function() {
        var msg = prompt('コミットメッセージを入力して下さい');
        if (msg != null) {
            console.log(viewer.model);
            DCaseAPI.commit(msg,viewer.opts.argument_id);
        }
    };

    this.show = function(m) {
        var ids = [
            '#menu-search',
            '#menu-export',
            '#menu-create',
            '#menu-tool',
            '#menu-color'
        ];
        $.each(ids, function(i, id) {
            if (m == id) $(id).toggle();
            else $(id).hide();
        });
    };

    //--------------------------------------------------------
    var $search = $('#menu-search-i')
            .click(function(e) {
                self.show('#menu-search');
                $('#menu-search input').focus();
            })
            .appendTo(root);

    $('#menu-search input').blur(function(e) {
        clearInterval(this.interval_id);
        delete this.interval_id;
    }).keydown(function(e) {
        if (e.keyCode == 13) { // Enter key
            var i = this;
            var r = DCaseAPI.search({
                SearchText: i.value
            });
            self.showSearchResult(r);
        }
    });

    this.showSearchResult = function(result) {
        var $field = $('#menu-search ul');
        $field.empty();
        for (var i = 0; i < result.NodeIdList.length; i++) {
            var r = DCaseAPI.call('getNode', {NodeId: result.NodeIdList[i]});
            showResult($field, r);
        }
        function showResult($field, result) {
            $('<ul>')
                    .addClass('sidemenu-result')
                    .html('<li>' + result.Node.Description + '</li>')
                    //.html('<li>' + name + '<ul>' + desc + '</ul></li>')
                    .click(function() {
                        initViewer(result.Node.BelongedArgumentId);
                        //viewer.centerize(v, 500);
                    })
                    .appendTo($field);
        };
    };

    //this.search = function(text) {
    //    var $res = $('#menu-search ul');
    //    $res.empty();
    //    text = text.toLowerCase();
    //    function getPreviewText(target, text) { // [TODO] add color
    //        var index = target.toLowerCase().indexOf(text);
    //        var ret = target.substr(0, index) +
    //            '<b>' + target.substr(index, text.length) +
    //            '</b>' + target.substr(index + text.length)
    //        return ret;
    //    };
    //    function showResult($res, v, name, desc) {
    //        $('<ul>')
    //                .addClass('sidemenu-result')
    //                .html('<li>' + name + '</li>')
    //                //.html('<li>' + name + '<ul>' + desc + '</ul></li>')
    //                .click(function() {
    //                    viewer.centerize(v, 500);
    //                })
    //                .appendTo($res);
    //    };
    //    function cmp(v) {
    //        var name = v.node.name;
    //        var desc = v.node.text;
    //        var d_index = desc.toLowerCase().indexOf(text);
    //        var n_index = name.toLowerCase().indexOf(text);
    //        if (d_index != -1 || n_index != -1) {
    //            var ptext = getPreviewText(desc, text);
    //            showResult($res, v, name, ptext);
    //        }
    //        v.forEachNode(cmp);
    //    }
    //    cmp(viewer.rootview);
    //}

    //var prev_isesarch = '';
    //this.search_inc = function(text) {
    //    if (text !== prev_isesarch) {
    //        this.search(text);
    //    }
    //    prev_isesarch = text;
    //}

    //--------------------------------------------------------
    var $export = $('#menu-export-i')
            .click(function(e) {
                self.show('#menu-export');
            })
            .appendTo(root);

    $('#menu-export-json').click(function() {
        self.actExportJson();
    });

    $('#menu-export-png').click(function() {
        self.actExportPng();
    });

    $('#menu-export-dscript').click(function() {
        self.actExportDScript();
    });


    //--------------------------------------------------------
    var $create = $('#menu-create-i')
            .click(function(e) {
                self.show('#menu-create');
            })
            .appendTo(root);
    $('#menu-create-argument').click(function(e) {
        // create new Argument
        var cmtr = $('#argument_committer').val();
        var desc = $('#argument_description').val();
        var r = DCaseAPI.call('CreateTopGoal',
            {
                'Committer': cmtr,
                'ProcessType': 1,
                'Description': desc,
                'Justification': 'first commit'
            });
        initViewer(r.BelongedArgumentId);
    });

    //--------------------------------------------------------
    var $tool = $('#menu-tool-i')
            .click(function(e) {
                self.show('#menu-tool');
            })
            .appendTo(root);

    $('#menu-tool-commit').click(function() {
        self.actCommit();
    });

    //--------------------------------------------------------
    var $color = $('#menu-color-i').click(function() {
        self.show('#menu-color');
    }).appendTo(root);
    $('.colorpicker').colorPicker();
    $('#color-goal').change(function() {
        $($('.dnode-goal'), viewer.svgroot).css({
            fill: $(this).val()
        });
    });
    $('#color-strategy').change(function() {
        $($('.dnode-strategy'), viewer.svgroot).css({
            fill: $(this).val()
        });
    });
    $('#color-context').change(function() {
        $($('.dnode-context'), viewer.svgroot).css({
            fill: $(this).val()
        });
    });
});
