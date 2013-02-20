USE dcasecloud;

DELETE FROM link_identity;
DELETE FROM node_data;
DELETE FROM node_identity;
DELETE FROM node_link;
DELETE FROM node_link_has_snapshot;
DELETE FROM node_property;
DELETE FROM node_type;
DELETE FROM argument_has_process_context;
DELETE FROM argument;
DELETE FROM process_context_has_snapshot;
DELETE FROM snapshot_has_node_data;
DELETE FROM snapshot;
DELETE FROM process_context;

ALTER TABLE argument                     AUTO_INCREMENT = 1;
ALTER TABLE link_identity                AUTO_INCREMENT = 1;
ALTER TABLE node_data                    AUTO_INCREMENT = 1;
ALTER TABLE node_identity                AUTO_INCREMENT = 1;
ALTER TABLE node_link                    AUTO_INCREMENT = 1;
ALTER TABLE node_property                AUTO_INCREMENT = 1;
ALTER TABLE node_type                    AUTO_INCREMENT = 1;
ALTER TABLE process_context              AUTO_INCREMENT = 1;
ALTER TABLE snapshot                     AUTO_INCREMENT = 1;

