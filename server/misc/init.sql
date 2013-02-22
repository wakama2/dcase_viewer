USE `dcasecloud`;
-- Init id=0
SET sql_mode='NO_AUTO_VALUE_ON_ZERO';
INSERT INTO `snapshot`(`id`,`prev_snapshot_id`,`root_node_id`,`unix_time`) VALUES(0,0,0,0);
INSERT INTO `process_context`(`id`,`current_snapshot_id`) VALUES(0,0);
INSERT INTO `argument`(`id`,`current_process_id`) VALUES(0,0);
INSERT INTO `node_type` (`id`,`type_name`) VALUES(0,'');
INSERT INTO `node_identity` (`id`,`argument_id`,`current_node_id`) VALUES(0,0,0);
INSERT INTO `link_identity` (`id`,`argument_id`,`current_node_link_id`) VALUES(0,0,0);
INSERT INTO `node_data`(`id`,`url`,`description`,`delete_flag`,`node_type_id`,`node_identity_id`,`node_prev_id`,`node_next_id`) VALUES(0,NULL,NULL,FALSE,0,0,0,0);
INSERT INTO `node_link`(`id`,`node_parent_id`,`node_child_id`,`link_identity_id`,`is_realpath`) VALUES(0,0,0,0,FALSE);

INSERT INTO `node_type` (`type_name`) VALUES
('Goal'),
('Strategy'),
('Context'),
('Evidence'),
('Support'),
('Rebuttal'),
('Subject'),
('Solution');
