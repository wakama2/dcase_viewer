//-------------------------------------
// const
var ANIME_MSEC = 250;
var X_MARGIN = 30;
var Y_MARGIN = 100;
var SCALE_MIN = 0.1;
var SCALE_MAX = 6.0;
var SVG_NS = 'http://www.w3.org/2000/svg';

//-------------------------------------
// global

var DCaseViewer = (function() {
    function DCaseViewer(root, model, opts) {
        root.className = 'viewer-root';
        this.svgroot = $(document.createElementNS(SVG_NS, 'svg')).css({
            position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'
            });
        this.root = root;
        this.opts = opts;
        this.moving = false;
        this.shiftX = 0;
        this.shiftY = 0;
        this.dragX = 0;
        this.dragY = 0;
        this.scale = 1.0;
        this.drag_flag = true;
        this.selectedNode = null;
        this.rootview = null;
        this.model = model;
        this.setModel(model);
        this.addEventHandler();
        this.setTextSelectable(false);
    };

    DCaseViewer.prototype.setModel = function(model) {
        $(this.svgroot).empty();
        $(this.root)
            .empty()
            .append(this.svgroot);
        this.model = model;
        if (model == null) return;

        var self = this;
        function create(node) {
            var view = new DNodeView(self, node);
            if (node.context != null) {
                view.addChild(create(node.context));
            }
            for (var i = 0; i < node.children.length; i++) {
                view.addChild(create(node.children[i]));
            }
            return view;
        }
        this.rootview = create(model);

        setTimeout(function() {
            function f(v) {
                var b = v.getOuterSize(200, v.divText.height() / self.scale + 60);
                v.bounds.w = b.w;
                v.bounds.h = b.h;
                v.forEachNode(function(e) {
                    f(e);
                });
            }
            f(self.rootview);
            self.shiftX = ($(self.root).width() - self.rootview.updateLocation(0, 0).x * self.scale) / 2;
            self.shiftY = 20;
            self.repaintAll();
        }, 100);
    };

    DCaseViewer.prototype.centerize = function(view, ms) {
        this.selectedNode = view;
        this.rootview.updateLocation(0, 0);
        var b = view.bounds;
        this.shiftX = -b.x * this.scale + ($(this.root).width() - b.w * this.scale) / 2;
        this.shiftY = -b.y * this.scale + $(this.root).height() / 5 * this.scale;
        this.repaintAll(ms);
    };

    DCaseViewer.prototype.repaintAll = function(ms) {
        var self = this;
        if (self.rootview == null) {
            return;
        }
        var rootview = self.rootview;
        //console.log(self.rootview);
        //console.log(self);
        rootview.updateLocation(
                (self.shiftX + self.dragX) / self.scale,
                (self.shiftY + self.dragY) / self.scale);
        var a = new Animation();
        rootview.animeStart(a);
        if (ms == 0) {
            a.animeFinish();
            return;
        }
        self.moving = true;
        var begin = new Date();
        var id = setInterval(function() {
            var time = new Date() - begin;
            var r = time / ms;
            if (r < 1.0) {
                a.anime(r);
            } else {
                clearInterval(id);
                a.animeFinish();
                self.moving = false;
            }
        }, 1000 / 60);
    };

    DCaseViewer.prototype.prevVersion = function(v) {
        var node = v.node;
        var prev = node.prevVersion;
        if (prev != null) {
            var parent = node.parents[0];
            for (var i = 0; i < parent.children.length; i++) {
                if (parent.children[i] == node) {
                    parent.children[i] = prev;
                    if (prev.parents.length == 0) {
                        prev.parents.push(parent);
                    }
                    this.setModel(this.model);
                    break;
                }
            }
        }
    };

    DCaseViewer.prototype.nextVersion = function(v) {
        var node = v.node;
        var next = node.nextVersion;
        if (next != null) {
            var parent = node.parents[0];
            for (var i = 0; i < parent.children.length; i++) {
                if (parent.children[i] == node) {
                    parent.children[i] = next;
                    if (next.parents.length == 0) {
                        next.parents.push(parent);
                    }
                    this.setModel(this.model);
                    break;
                }
            }
        }
    };

    DCaseViewer.prototype.setSnapshot = function(n) {
            var ss = this.snapshotList[n];
            var node = DCaseAPI.call("getNodeTreeFromSnapshotId", {
                BelongedArgumentId: this.opts.argument_id,
                SnapshotId: ss.SnapshotId
            });
            this.setModel(createNodeFromJson(node));
        };

    DCaseViewer.prototype.createTimeline = function(dom_id) {
        var r = DCaseAPI.call("getSnapshotList", { BelongedArgumentId: this.opts.argument_id });
        var l = r.SnapshotList;
        this.snapshotList = l;
        var dates = [];
        for(var i=0; i<l.length; i++) {
            var id = l[i].SnapshotId;
            var time = l[i].UnixTime;
            dates.push({
                "startDate": new Date(time),
                "endDate"  : new Date(time),
                "headline" : "Snapshot " + id,
                "text":"<p>Body text goes here, some HTML is OK</p>",
                "asset": {
                    "credit":"Credit Name Goes Here",
                    "caption":"Caption text goes here"
                }
            });
        }
        var timeline =  {
            "headline": "The Main Timeline Headline Goes here",
            "type": "default",
            "text": "",
            "asset": {
                "credit":"Credit Name Goes Here",
                "caption":"Caption text goes here"
            },
            "date": dates,
        };
        createStoryJS({
            type    : "timeline",
            width   : '100%',
            height  : '240',
            source  : { timeline: timeline },
            embed_id: dom_id,
            css     : 'lib/timeline.css',
            js      : 'lib/timeline.js'
        });
    };

    DCaseViewer.prototype.showToolbox = function(node) {
        var self = this;
        if (this.toolboxNode != node) {
            if (node != null) {
                var data = node.node;
                var b = node.div.offset();
                var w = node.div.width();
                var x = 120;

                $('#toolbar').css({
                    display: 'block',
                    left: b.left + (w - x) / 2,
                    top: b.top - 40,
                    width: x,
                    height: 30
                });

                $('#toolbar .tool-left').css('display', data.prevVersion != null ? 'inline' : 'none');
                $('#toolbar .tool-right').css('display', data.nextVersion != null ? 'inline' : 'none');
                $('#toolbar .tool-play').css('display', data.isDScript() ? 'inline' : 'none');
                $('#toolbar .tool-up').css('display', node.childVisible ? 'inline' : 'none');
                $('#toolbar .tool-down').css('display', node.childVisible ? 'none' : 'inline');
            } else {
                $('#toolbar').css('display', 'none');
            }
            this.toolboxNode = node;
        }
    };

    DCaseViewer.prototype.setDragLock = function(b) {
        this.drag_flag = b;
    };

    DCaseViewer.prototype.getDragLock = function() {
        return this.drag_flag;
    };

    DCaseViewer.prototype.setSelectedNode = function(node) {
        this.selectedNode = node;
        this.repaintAll();
        this.showToolbox(node);
    };

    DCaseViewer.prototype.getSelectedNode = function() {
        return this.selectedNode;
    };

    DCaseViewer.prototype.actExpandBranch = function(view, b) {
        if (b == undefined || b != view.childVisible) {
            this.rootview.updateLocation(0, 0);
            var b0 = view.bounds;
            view.setChildVisible(!view.childVisible);
            this.rootview.updateLocation(0, 0);
            var b1 = view.bounds;
            this.shiftX -= (b1.x - b0.x) * this.scale;
            this.shiftY -= (b1.y - b0.y) * this.scale;
            this.repaintAll(ANIME_MSEC);
        }
    };

    DCaseViewer.prototype.setTextSelectable = function(b) {
        var p = b ? 'auto' : 'none';
        $(this.root).css({
                'user-select': p,
                '-moz-user-select': p,
                '-webkit-user-select': p
                });
    };

    DCaseViewer.prototype.fit = function(ms) {
        var size = this.rootview.updateLocation(0, 0);
        this.scale = Math.min(
                $(this.root).width() * 0.98 / size.x,
                $(this.root).height() * 0.98 / size.y);
        var b = this.rootview.bounds;
        this.shiftX = -b.x * this.scale + ($(this.root).width() - b.w * this.scale) / 2;
        this.shiftY = -b.y * this.scale + ($(this.root).height() - size.y * this.scale) / 2;
        this.repaintAll(ms);
    };

    DCaseViewer.prototype.traverseAll = function(f) {
        function traverse(node) {
            f(node);
            if (node.context != null) f(node.context);
            for (var i = 0; i < node.children.length; i++) {
                traverse(node.children[i]);
            }
        }
        traverse(this.model);
    };

    DCaseViewer.prototype.createSvg = function(name) {
        var obj = document.createElementNS(SVG_NS, name);
        this.svgroot.append(obj);
        return obj;
    };

    DCaseViewer.prototype.showDScriptExecuteWindow = function(scriptName) {
        var self = this;
        self.showToolbox(null);
        var r = DCaseAPI.call('search', { filter: ['Context'] });
        var nn = null;
        for (var i = 0; i < r[0].length; i++) {
            if (r[0][i].value === scriptName) {
                var n = DCaseAPI.get([], r[0][i].argument_id);
                nn = createNodeFromJson(n);
                break;
            }
        }
        if (nn.context != null) {
            nn.context.type = 'Subject';
        }
        var t = $('<div></div>')
            .addClass('dscript-exe-window')
            .appendTo(self.root);

        var r1x = document.createElement('div');
        var t1 = $(r1x).css({
            position: 'absolute',
            left: '20px', top: '20px', right: '20px', bottom: '60px'
        }).attr('id', 'subviewer');
        t.append(t1);
        var v = new DCaseViewer(r1x, nn, {
            argument_id: self.opts.id
        });
        t.append($('<input></input>').attr({
            type: 'button', value: '実行'
        }).click(function() {
            var r = DCaseAPI.call('run', {});
            alert(r);
        }));
        t.append($('<input></input>').attr({
            type: 'button', value: 'キャンセル'
        }).click(function() {
            t.remove();
        }));
    };
    return DCaseViewer;
})();

function ViewerInit(body, DCase_Viewer) {
    DCase_Viewer.tmp_id = 0;
    var menu = new SideMenu(document.body, DCase_Viewer);
    $('.tool-new').click(function() {
        menu.actInsertToSelectedNode();
    });
    $('.tool-edit').click(function() {
        menu.actEditSelectedNode();
    });
    $('.tool-remove').click(function() {
        menu.actRemoveSelectedNode();
    });
    $('.tool-left').click(function() {
        DCase_Viewer.prevVersion(DCase_Viewer.getSelectedNode());
    });
    $('.tool-right').click(function() {
        DCase_Viewer.nextVersion(DCase_Viewer.getSelectedNode());
    });
    $('.tool-up').click(function() {
        DCase_Viewer.actExpandBranch(DCase_Viewer.getSelectedNode(), false);
        $('.tool-up').css('display', 'none');
        $('.tool-down').css('display', 'inline');
    });
    $('.tool-down').click(function() {
        DCase_Viewer.actExpandBranch(DCase_Viewer.getSelectedNode(), true);
        $('.tool-up').css('display', 'inline');
        $('.tool-down').css('display', 'none');
    });
    $('.tool-play').click(function() {
        var v = DCase_Viewer.getSelectedNode();
        DCase_Viewer.showDScriptExecuteWindow(v.node.name);
    });
    $('#timeline').css({
        position: 'absolute',
        bottom: '0px',
        margin: '0px'
    });
    DCase_Viewer.createTimeline('timeline');
}
