--0番idを作る
--linkのparent_node_idはnode_identityのid
--Argumentの新規作成シナリオ
--1.Snapshotの作成
--2.Processのオープン
--3.Argumentの作成
--4.TopGoalの作成
--5.Argumentのidを返す

INSERT INTO `snapshot`(`prev_snapshot_id`,`unix_time`) VALUES(?,?);
INSERT INTO `process_context`(`current_snapshot_id`,`process_type`,`justification`,`commiter`) VALUES(?,?,?,?);
INSERT INTO `argument`(`current_process_id`) VALUES(?);
INSERT INTO `node_identity`(`argument_id`) VALUES(?);
SELECT `id` FROM `node_type` WHERE `type_name`=?;
INSERT INTO `node_data`(`node_type_id`,`node_identity_id`) VALUES(?,?); --Goal
UPDATE `snapshot` SET `root_node_id`=? WHERE `id`=? --node_identity_id,snapshot_id

INSERT INTO `process_context_has_snapshot` (`process_context_id`,`snapshot_id`) VALUES(?,?);
INSERT INTO `snapshot_has_node_data` (`snapshot_id`,`node_data_id`) VALUES(?,?);
INSERT INTO `argument_has_process_context` (`argument_id`,`process_context_id`) VALUES(?,?);

--Process
-- * プロセスのオープン OpenProcess();
INSERT INTO process_context(current_snapshot_id,process_type,justification,commiter) VALUES(?,?,?,?);

-- * プロセスのクローズ処理とは
--1.マージ
--2.終了コミット?

--Commitのシナリオ
-- * 新しいノードの追加の場合
-- args: argument_id, nodes[], Links[]
-- return node_identity_ids[],link_identity_ids[]
--仮node_idを渡して
INSERT INTO `snapshot`(`prev_snapshot_id`,`unix_time`) VALUES(?,?);
--while(nodes.getSize()) {
INSERT INTO `node_identity`(`argument_id`) VALUES(?);
SELECT `id` FROM `node_type` WHERE `type_name`=?;
INSERT INTO `node_data`(`node_type_id`,`node_identity_id`,`description`,`url`) VALUES(?,?,?,?);
--INSERT INTO `snapshot_has_node_data` (`snapshot_id`,`node_data_id`) VALUES(?,?);

----while(nodes[i].property.getSize()){
--TODO
INSERT INTO `node_property`(`property_key`,`property_value`,`node_data_id`) VALUES(?,?,?);
----}
--}
--while(links.getSize()){
INSERT INTO `link_identity`(`argument_id`) VALUES(?);
INSERT INTO `node_link`(`parent_node_id`,`child_node_id`,`link_identity_id`) VALUES(?,?,?);
--INSERT INTO `node_link_has_snapshot` (`node_link_id`,`snapshot_id`) VALUES(?,?);
--}

-- * ノードの変更の場合
INSERT INTO `node_data`(`node_type_id`,`node_identity_id`,`description`,`url`) VALUES(?,?,?,?);
UPDATE `node_identity` SET current_node_id=? WHERE `id`=?;

--INSERT INTO `snapshot_has_node_data` (`snapshot_id`,`node_data_id`) VALUES(?,?);

-- * ノードの削除の場合
--要相談
INSERT INTO `node_data`(`node_type_id`,`node_identity_id`,`description`,`url`,`delete_flag`) VALUES(?,?,?,?,TRUE);
UPDATE `node_identity` SET current_node_id=? WHERE `id`=?;

--INSERT INTO `snapshot_has_node_data` (`snapshot_id`,`node_data_id`) VALUES(?,?);

-- *最後にsnapshotを貼る
-- ->node_identityにcurrentを持たせて、変更した後これにsnapshotを貼る。
INSERT INTO `snapshot_has_node_data`(snapshot_id,node_data_id)
	SELECT ? AS snapshot_id,current_node_id FROM node_identity WHERE argument_id=?;

INSERT INTO `node_link_has_snapshot`(node_link_id,snapshot_id)
	SELECT ? AS snapshot_id,current_node_link_id FROM link_identity WHERE argument_id=?;

-- Get
-- * Argumentの一覧
SELECT `id` FROM `argument`;
-- * Argumentの中身
SELECT current_snapshot_id AS snapshot_id,root_node_id FROM argument
	INNER JOIN process_context ON current_process_id=process_context.id;

-- *snapshot_idからnode_dataを取ってくる
SELECT node_identity_id, url, description, delete_flag, type_name
	FROM snapshot_has_node_data
		INNER JOIN node_data ON node_data_id=node_data.id
	WHERE snapshot_id=?;

-- *snapshot_idからnode_linkを取ってくる
SELECT parent_node_id,child_node_id FROM node_link_has_snapshot
	INNER JOIN node_link ON node_link_id=node_link.id
	WHERE snapshot_id=?;
