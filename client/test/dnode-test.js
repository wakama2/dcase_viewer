function createNodeFromJson2(json) {
    var id = json.id != null ? parseInt(json.id) : id_count++;
    var desc = json.desc ? json.desc : contextParams(json.prop);
    var node = new DNode(0, json.name, json.type, desc);
    if (json.prev != null) {
        node.prevVersion = createNodeFromJson2(json.prev);
        node.prevVersion.nextVersion = node;
    }
    if (json.children != null) {
        for (var i = 0; i < json.children.length; i++) {
            var child = createNodeFromJson2(json.children[i]);
            node.addChild(child);
        }
    }
    return node;
}

function createSampleNode() {
    var strategy_children = [
        {
            name: 'SubGoal 1', type: 'Goal', desc: 'description',
            children: [
                { name: 'C', type: 'DScriptContext', prop: { 'D-Script.Name': 'test' } },
                { name: 'test', type: 'Goal', desc: 'goal1' },
                { name: 'test', type: 'Goal', desc: 'goal2' }
            ]
        },
        {
            name: 'SubGoal 2', type: 'Goal', desc: 'description',
            children: [
                { name: 'Context 2', type: 'Context', desc: '' }
            ],
            prev: { name: 'SubGoal 2 old', type: 'Goal', desc: 'old version' }
        },
        {
            name: 'SubGoal 3', type: 'Goal', desc: 'description',
            children: [
                { name: 'Context 3.1', type: 'Context', desc: 'description' },
                { name: 'SubGoal 3.1', type: 'Goal', desc: 'description' },
                { name: 'SubGoal 3.2', type: 'Goal', desc: 'description',
                    children: [{
                        name: 'reboot.ds', type: 'DScriptEvidence', desc: 'shutdown -r now',
                        children: [{ name: 'R', type: 'Rebuttal', desc: 'error' }]
                    }]},
                { name: 'SubGoal 3.3', type: 'Goal', desc: 'description' },
                { name: 'SubGoal 3.3', type: 'Goal', desc: 'description' }
            ]
        },
        { name: 'SubGoal 4', type: 'Goal', desc: 'description' }
    ];

    return createNodeFromJson2({
        name: 'TopGoal', type: 'Goal',
        desc: 'ウェブショッピングデモ\n' +
                    'システムはDEOSプロセスにより運用され，OSDを満たしている',
        children: [
            {
                name: 'Context',
                type: 'Context',
                desc: 'サービス用件:\n' +
                            '・アクセス数の定格は2500件/分\n' +
                            '・応答時間は1件あたり3秒以内\n' +
                            '・一回の障害あたりの復旧時間は5分以内\n'
            },
            {
                name: 'Strategy', type: 'Strategy', desc: 'DEOSプロセスによって議論する',
                children: strategy_children
            }
        ]
    });
}

console.log(createSampleNode());
