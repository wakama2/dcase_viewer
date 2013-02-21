var FONT_SIZE = 13;
var MIN_DISP_SCALE = 4 / FONT_SIZE;
function toHTML(txt) {
    if (txt == '') {
        return '<font color=' + CONFIG.DefaultTextColor + '>(no description)</font>';
    }
    var x = txt
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
    return x;
}

var DEF_WIDTH = 200;

/* class DNodeView */
var DNodeView = function(viewer, node) {
    var self = this;
    this.viewer = viewer;
    this.firstNode = node;
    this.node = node;
    this.svg = this.initSvg(node.type);
    this.div = $('<div></div>')
            .addClass('node-container')
            .width(DEF_WIDTH)
            .appendTo(viewer.root);

    if (node.isUndevelop()) {
        this.svgUndevel = $(document.createElementNS(SVG_NS, 'polygon')).attr({
            class: 'dnode dnode-undevelop'
        }).appendTo(viewer.svgroot);
    }
    this.argumentBorder = null;
    if (node.isArgument()) {
        this.argumentBorder = $(document.createElementNS(SVG_NS, 'rect')).attr({
            class: 'dnode dnode-argument', 'stroke-dasharray': 3
        }).appendTo(viewer.svgroot);
    }
    this.argumentBounds = {};

    this.divName = $('<div></div>').addClass('node-name').html(node.name);
    this.div.append(this.divName);

    this.divText = $('<div></div>').addClass('node-text').html(toHTML(node.text));
    this.div.append(this.divText);

    this.divNodes = $('<div></div>').addClass('node-closednodes');
    this.div.append(this.divNodes);

    this.divNodesText = '';
    this.divNodesVisible = false;

    this.childOpen = true;
    // child node
    this.children = [];
    this.context = null;
    // line
    this.lines = [];
    this.contextLine = null;
    // for animation
    this.bounds = { x: 0, y: 0, w: DEF_WIDTH, h: 100 };
    this.visible = true;
    this.childVisible = true;

    var touchinfo = {};
    var editflag = false;
    this.div.mouseup(function(e) {
        if (self == viewer.getSelectedNode() && !editflag) {
            editflag = true;
            self.divText.text('');
            if (node.isDScript()) {
                $('<textarea></textarea>').appendTo(self.div)
                .attr('value', node.text)
                .focus()
                .attr('id', 'script-editor');
                var editor = CodeMirror.fromTextArea($('#script-editor')[0], {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: 'shell'
                });
                editor.on('blur', function(i) {
                    node.text = i.getValue();
                    self.divText.html(toHTML(node.text));
                    $('#script-editor').remove();
                    $('.CodeMirror').remove();
                    editflag = false;
                    setTimeout(function() {
                        var b = self.getOuterSize(200, self.divText.height() / self.viewer.scale + 60);
                        self.bounds.h = b.h;
                        viewer.repaintAll();
                    }, 100);
                });
            } else {
                $('<textarea></textarea>').css({
                    top: self.divText.attr('top')
                })
                .addClass('editor')
                .attr('value', node.text)
                .appendTo(self.div)
                .focus()
                .mousedown(function(e) { e.stopPropagation(); })
                .mouseup(function(e) { e.stopPropagation(); })
                .mousemove(function(e) { e.stopPropagation(); })
                .click(function(e) { e.stopPropagation(); })
                .mousewheel(function(e) { e.stopPropagation(); })
                .blur(function() {
                    node.text = $(this).attr('value');
                    self.divText.html(toHTML(node.text));
                    $(this).remove();
                    editflag = false;
                    setTimeout(function() {
                        var b = self.getOuterSize(200, self.divText.height() / self.viewer.scale + 60);
                        self.bounds.h = b.h;
                        viewer.repaintAll();
                    }, 100);
                });
            }
        }
        viewer.dragEnd(self);
    }).bind('touchstart', function(e) {
        var touches = e.originalEvent.touches;
        touchinfo.count = touches.length;
    }).bind('touchend', function(e) {
        viewer.dragEnd(self);
        if (touchinfo.time != null && (new Date() - touchinfo.time) < 300) {
            viewer.actExpandBranch(self);
            touchinfo.time = null;
        }
        if (touchinfo.count == 1) {
            touchinfo.time = new Date();
        } else {
            touchinfo.time = null;
        }
    });

    //this.div.hover(function() {
    //    viewer.showToolbox(self);
    //}, function() {
    //    viewer.showToolbox(null);
    //});
};

function CreateGoal(Viewer, root) {
    var n = 10;
    var o = root.createSvg('rect');
    o.setBounds = function(a, x, y, w, h) {
        a.moves(this, {
            x: x,
            y: y,
            width: w,
            height: h
        });
    };
    Viewer.getOuterSize = function(w, h) {
        return { w: w + n * 2, h: h + n * 2 };
    };
    o.offset = { x: n, y: n };
    $(o).attr('class', 'dnode dnode-goal');
    return o;
}
function CreateContext(Viewer, root) {
    var n = 20;
    var o = root.createSvg('rect');
    o.setBounds = function(a, x, y, w, h) {
        a.moves(this, {
            rx: n * root.scale,
            ry: n * root.scale,
            x: x,
            y: y,
            width: w,
            height: h
        });
    };
    Viewer.getOuterSize = function(w, h) {
        return { w: w + n, h: h + n };
    };
    o.offset = { x: n / 2, y: n / 2 };

    $(o).attr('class', 'dnode dnode-context');
    return o;
}
function CreateStrategy(Viewer, root) {
    var o = root.createSvg('polygon');
    o.setBounds = function(a, x, y, w, h) {
        var n = 20 * root.scale;
        a.movePolygon(this, [
            { x: x + n, y: y },
            { x: x + w, y: y },
            { x: x + w - n, y: y + h },
            { x: x, y: y + h }
        ]);
    };
    Viewer.getOuterSize = function(w, h) {
        return { w: w + 20 * 2, h: h + 10 * 2 };
    };
    o.offset = { x: 25, y: 10 };
    $(o).attr('class', 'dnode dnode-strategy');
    return o;
}
function CreateSubject(Viewer, root) {
    var o = root.createSvg('g');
    var o1 = root.createSvg('rect');
    var o2 = root.createSvg('polygon');
    o.appendChild(o1);
    o.appendChild(o2);
    o.setBounds = function(a, x, y, w, h) {
        var n = 20 * root.scale;
        a.moves(o1, {
            rx: n,
            ry: n,
            x: x,
            y: y,
            width: w,
            height: h
        });
        a.movePolygon(o2, [
            { x: x + w * 5 / 8, y: y - n },
            { x: x + w * 5 / 8, y: y + n },
            { x: x + w * 5 / 8 + n * 2, y: y }
        ]);
        o.offset = { x: n / 2, y: n / 2 };
    };
    Viewer.getOuterSize = function(w, h) {
        return { w: w + 20, h: h + 20 };
    };
    o.offset = { x: 1, y: 1 };
    $(o).attr('class', 'dnode dnode-subject');
    $(o1).attr('class', 'dnode dnode-subject');
    $(o2).attr('class', 'dnode dnode-subject');
    return o;
}
function CreateSolution(Viewer, root) {
    var o1 = root.createSvg('ellipse');
    var o2 = root.createSvg('polygon');
    var o = root.createSvg('g');
    o.appendChild(o1);
    o.appendChild(o2);
    o.setBounds = function(a, x, y, w, h) {
        a.moves(o1, {
            cx: x + w / 2,
            cy: y + h / 2,
            rx: w / 2,
            ry: h / 2
        });
        var n = 20 * root.scale;
        a.movePolygon(o2, [
            { x: x + w * 5 / 8, y: y - n },
            { x: x + w * 5 / 8, y: y + n },
            { x: x + w * 5 / 8 + n * 2, y: y }
        ]);
        o.offset = { x: w / 6 / root.scale, y: h / 6 / root.scale };
    };
    Viewer.getOuterSize = function(w, h) {
        return { w: w * 8 / 6, h: h * 8 / 6 };
    };
    o.offset = { x: 200 / 6, y: 200 / 6 };

    $(o).attr('class', 'dnode dnode-solution');
    $(o1).attr('class', 'dnode dnode-solution');
    $(o2).attr('class', 'dnode dnode-solution');
    return o;
}
function CreateCommonNode(Viewer, root) {
    var o = root.createSvg('ellipse');
    o.setBounds = function(a, x, y, w, h) {
        a.moves(this, {
            cx: x + w / 2,
            cy: y + h / 2,
            rx: w / 2,
            ry: h / 2
        });
        o.offset = { x: w / 6 / root.scale, y: h / 6 / root.scale };
    };
    Viewer.getOuterSize = function(w, h) {
        return { w: w * 8 / 6, h: h * 8 / 6 };
    };
    o.offset = { x: 0, y: 0 };
    $(o).attr('class', 'dnode');
    return o;
}

DNodeView.prototype.initSvg = function(type) {
    var root = this.viewer;
    if (type == 'Goal') {
        return CreateGoal(this, root);
    } else if (type == 'Context') {
        return CreateContext(this, root);
    } else if (type == 'Subject') {
        return CreateSubject(this, root);
    } else if (type == 'Strategy') {
        return CreateStrategy(this, root);
    } else if (type == 'Solution') {
        return CreateSolution(this, root);
    } else if (type == 'Evidence' || type == 'Rebuttal') {
        return CreateCommonNode(this, root);
    }
    /* unreachable */
    throw type + ' is not GSN type';
};

function getClassNameByType(type) {
    if (type == 'Rebuttal')
        return 'dnode dnode-rebuttal';
    if (type == 'Evidence')
        return 'dnode dnode-evidence';
    if (type == 'Goal')
        return 'dnode dnode-goal';
    if (type == 'Context')
        return 'dnode dnode-context';
    if (type == 'Strategy')
        return 'dnode dnode-strategy';
    if (type == 'Rebuttal')
        return 'dnode dnode-rebuttal';
    if (type == 'Subject')
        return 'dnode dnode-subject';
    console.log(type);
    return 'dnode';
}

DNodeView.prototype.forEachNode = function(f) {
    if (this.context != null) {
        f(this.context);
    }
    var children = this.children;
    for (var i = 0; i < children.length; i++) {
        f(children[i]);
    }
};

DNodeView.prototype.setChildVisible = function(b) {
    this.childVisible = b;
    this.childOpen = b;
    this.forEachNode(function(e) {
        e.setVisible(b);
    });
};

DNodeView.prototype.setVisible = function(b) {
    this.visible = b;
    if (b) {
        b = this.childOpen;
    }
    this.childVisible = b;
    this.forEachNode(function(e) {
        e.setVisible(b);
    });
};

DNodeView.prototype.addChild = function(view) {
    switch (view.node.type) {
    case 'Context':
    case 'Rebuttal':
    case 'Subject':
        var l = this.viewer.createSvg('line');
        $(l).attr({
            x1: 0, y1: 0, x2: 0, y2: 0,
            class: 'dnode-line',
            'marker-end': 'url(#Triangle-black)'
        });

        this.contextLine = l;
        this.context = view;
        break;
    default:
        var l = this.viewer.createSvg('path');
        $(l).attr({
            d: 'M0,0 C0,0 0,0 0,0',
            class: 'dnode-line',
            'marker-end': 'url(#Triangle-black)'
        });

        this.lines.push(l);
        this.children.push(view);
        break;
    }
    var length = this.lines.length;
    if (this.contextLine != null) {
        length += 1;
    }
    this.divNodesText = length + ' nodes...';
    this.divNodesVisible = true;
};

DNodeView.prototype.updateLocation = function(x, y) {
    var ARG_MARGIN = this.node.isArgument() ? 5 : 0;
    x += ARG_MARGIN;
    y += ARG_MARGIN;
    var x0 = x;
    var y0 = y;
    var w = this.bounds.w;
    var h = this.bounds.h;
    if (!this.visible || !this.childVisible) {
        this.forEachNode(function(e) {
            e.updateLocation(x, y);
        });
        this.bounds = { x: x, y: y, w: w, h: h };
        if (this.visible && this.node.isUndevelop()) {
            h += 40;
        }
        if (this.node.isArgument()) {
            this.argumentBounds = {
                x: x0 - ARG_MARGIN,
                y: y0 - ARG_MARGIN,
                w: w + ARG_MARGIN * 2,
                h: h + ARG_MARGIN * 2
            };
            w += ARG_MARGIN;
            h += ARG_MARGIN;
        }
        if (this.visible) {
            return { x: x + w, cx: x + w, y: y + h };
        } else {
            return { x: x, cx: x, y: y };
        }
    }
    // calc context height
    var contextHeight = 0;
    var childrenY = y0 + h + Y_MARGIN;
    if (this.context != null) {
        var cy = this.context.updateLocation(x, y).y;
        contextHeight = cy - y0;
        childrenY = Math.max(childrenY, cy + X_MARGIN);
    }
    var maxHeight = Math.max(contextHeight, h);

    // update children location
    var cx = x;
    $.each(this.children, function(i, e) {
        if (i != 0) x += X_MARGIN;
        var size = e.updateLocation(x, childrenY);
        x = size.x;
        cx = size.cx;
        maxHeight = Math.max(maxHeight, size.y - y0);
    });
    var maxWidth = Math.max(w, x - x0);
    var maxCWidth = Math.max(w, cx - x0);

    // update this location
    this.bounds = {
        x: x0 + (maxCWidth - w) / 2,
        y: y0 + Math.max((contextHeight - h) / 2, 0),
        w: w,
        h: h
    };

    // update context location
    if (this.context != null) {
        x = this.bounds.x + w + Y_MARGIN;
        y = y0 + Math.max((h - contextHeight) / 2, 0);
        var p = this.context.updateLocation(x, y);
        maxWidth = Math.max(maxWidth, p.x - x0);
    }
    if (this.node.isUndevelop()) {
        maxHeight += 40;
    }
    this.argumentBounds = {
        x: x0 - ARG_MARGIN,
        y: y0 - ARG_MARGIN,
        w: maxWidth + ARG_MARGIN * 2,
        h: maxHeight + ARG_MARGIN * 2
    };
    return {
        cx: x0 + maxCWidth + ARG_MARGIN,
        x: x0 + maxWidth + ARG_MARGIN,
        y: y0 + maxHeight + ARG_MARGIN
    };
};

DNodeView.prototype.animeStart = function(a) {
    var self = this;
    var scale = this.viewer.scale;
    var b = this.bounds;
    a.show(this.svg, this.visible);
    a.show(this.div, this.visible);
    a.show(this.divNodes, !this.childVisible);

    this.svg.setBounds(a, b.x * scale, b.y * scale,
            b.w * scale, b.h * scale);
    a.moves(this.div, {
        left: (b.x + this.svg.offset.x) * scale,
        top: (b.y + this.svg.offset.y) * scale,
        width: (b.w - this.svg.offset.x * 2) * scale,
        height: (b.h - this.svg.offset.y * 2) * scale,
        fontSize: Math.floor(FONT_SIZE * scale)
    });

    this.svg.setAttribute('class', getClassNameByType(this.node.type));
    if (this.viewer.selectedNode == this) {
        this.svg.setAttribute('class', this.svg.getAttribute('class') + ' dnode-focused');
    }
    if (scale < MIN_DISP_SCALE) {
        a.show(this.divText, false);
        a.show(this.divName, false);
        if (this.divNodesVisible) {
            this.divNodes.html('<p></p>');
        }
    } else {
        a.show(this.divText, true);
        a.show(this.divName, true);
        if (this.divNodesVisible) {
            this.divNodes.html(this.divNodesText);
        }
    }

    $.each(this.lines, function(i, l) {
        var e = self.children[i];
        var start = l.pathSegList.getItem(0); // SVG_PATHSEG_MOVETO_ABS(M)
        var curve = l.pathSegList.getItem(1); // SVG_PATHSEG_CURVETO_CUBIC_ABS(C)

        var x1 = (b.x + b.w / 2) * scale;
        var y1 = (b.y + b.h) * scale;
        var x2 = (e.bounds.x + e.bounds.w / 2) * scale;
        var y2 = (e.bounds.y) * scale;

        a.show(l, self.childVisible);

        a.moves(start, {
            x: x1,
            y: y1
        });
        a.moves(curve, {
            x1: (9 * x1 + x2) / 10,
            y1: (y1 + y2) / 2,
            x2: (9 * x2 + x1) / 10,
            y2: (y1 + y2) / 2,
            x: x2,
            y: y2
        });
    });
    if (this.contextLine != null) {
        var e = self.context;
        var l = self.contextLine;
        a.moves(l, {
            x1: (b.x + b.w) * scale,
            y1: (b.y + b.h / 2) * scale,
            x2: (e.bounds.x) * scale,
            y2: (e.bounds.y + e.bounds.h / 2) * scale
        }).show(l, self.childVisible);
    }
    if (this.svgUndevel != null) {
        var sx = (b.x + b.w / 2) * scale;
        var sy = (b.y + b.h) * scale;
        var n = 20 * scale;
        a.show(this.svgUndevel.context, this.visible);
        a.movePolygon(this.svgUndevel.context, [
            { x: sx, y: sy },
            { x: sx - n, y: sy + n },
            { x: sx, y: sy + n * 2 },
            { x: sx + n, y: sy + n }
        ]);
    }
    if (this.argumentBorder != null) {
        var n = 10;
        var b = this.argumentBorder.context;
        a.moves(b, {
            x: this.argumentBounds.x * scale,
            y: this.argumentBounds.y * scale,
            width: this.argumentBounds.w * scale,
            height: this.argumentBounds.h * scale
        }).show(b, this.visible);
    }
    this.forEachNode(function(e) {
        e.animeStart(a);
    });
};
