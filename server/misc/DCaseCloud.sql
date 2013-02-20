SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

CREATE SCHEMA IF NOT EXISTS `dcasecloud` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `dcasecloud` ;

-- -----------------------------------------------------
-- Table `dcasecloud`.`node_type`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`node_type` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `type_name` VARCHAR(30) NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`process_context`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`process_context` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `current_snapshot_id` INT NULL ,
  `process_type` VARCHAR(45) NULL ,
  `justification` VARCHAR(255) NULL ,
  `commiter` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`argument`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`argument` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `current_process_id` INT NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_argument_process_context1_idx` (`current_process_id` ASC) ,
  CONSTRAINT `fk_argument_process_context1`
    FOREIGN KEY (`current_process_id` )
    REFERENCES `dcasecloud`.`process_context` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`node_identity`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`node_identity` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `argument_id` INT NOT NULL ,
  `current_node_id` INT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_node_identity_argument1_idx` (`argument_id` ASC) ,
  CONSTRAINT `fk_node_identity_argument1`
    FOREIGN KEY (`argument_id` )
    REFERENCES `dcasecloud`.`argument` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`node_data`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`node_data` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `url` TEXT NULL ,
  `description` TEXT NULL ,
  `delete_flag` TINYINT(1) NULL DEFAULT FALSE ,
  `node_type_id` INT NOT NULL ,
  `node_identity_id` INT NOT NULL ,
  `node_prev_id` INT NULL ,
  `node_next_id` INT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_NodeData_NodeType1_idx` (`node_type_id` ASC) ,
  INDEX `fk_node_data_node_identity1_idx` (`node_identity_id` ASC) ,
  CONSTRAINT `fk_NodeData_NodeType1`
    FOREIGN KEY (`node_type_id` )
    REFERENCES `dcasecloud`.`node_type` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_node_data_node_identity1`
    FOREIGN KEY (`node_identity_id` )
    REFERENCES `dcasecloud`.`node_identity` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`link_identity`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`link_identity` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `argument_id` INT NOT NULL ,
  `current_node_link_id` INT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_link_identity_argument1_idx` (`argument_id` ASC) ,
  CONSTRAINT `fk_link_identity_argument1`
    FOREIGN KEY (`argument_id` )
    REFERENCES `dcasecloud`.`argument` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`node_link`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`node_link` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `node_parent_id` INT NOT NULL ,
  `node_child_id` INT NOT NULL ,
  `link_identity_id` INT NOT NULL ,
  `is_realpath` TINYINT(1) NULL DEFAULT FALSE ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_NodeLink_Link1_idx` (`link_identity_id` ASC) ,
  INDEX `fk_node_link_node_data1_idx` (`node_parent_id` ASC) ,
  INDEX `fk_node_link_node_data2_idx` (`node_child_id` ASC) ,
  CONSTRAINT `fk_NodeLink_Link1`
    FOREIGN KEY (`link_identity_id` )
    REFERENCES `dcasecloud`.`link_identity` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_node_link_node_data1`
    FOREIGN KEY (`node_parent_id` )
    REFERENCES `dcasecloud`.`node_data` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_node_link_node_data2`
    FOREIGN KEY (`node_child_id` )
    REFERENCES `dcasecloud`.`node_data` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`snapshot`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`snapshot` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `prev_snapshot_id` INT NULL ,
  `unix_time` BIGINT NULL ,
  `root_node_id` INT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`snapshot_has_node_data`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`snapshot_has_node_data` (
  `snapshot_id` INT NOT NULL ,
  `node_data_id` INT NOT NULL ,
  PRIMARY KEY (`snapshot_id`, `node_data_id`) ,
  INDEX `fk_Snapshot_has_NodeData_NodeData1_idx` (`node_data_id` ASC) ,
  INDEX `fk_Snapshot_has_NodeData_Snapshot1_idx` (`snapshot_id` ASC) ,
  CONSTRAINT `fk_Snapshot_has_NodeData_Snapshot1`
    FOREIGN KEY (`snapshot_id` )
    REFERENCES `dcasecloud`.`snapshot` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Snapshot_has_NodeData_NodeData1`
    FOREIGN KEY (`node_data_id` )
    REFERENCES `dcasecloud`.`node_data` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`node_link_has_snapshot`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`node_link_has_snapshot` (
  `node_link_id` INT NOT NULL ,
  `snapshot_id` INT NOT NULL ,
  PRIMARY KEY (`node_link_id`, `snapshot_id`) ,
  INDEX `fk_NodeLink_has_Snapshot_Snapshot1_idx` (`snapshot_id` ASC) ,
  INDEX `fk_NodeLink_has_Snapshot_NodeLink1_idx` (`node_link_id` ASC) ,
  CONSTRAINT `fk_NodeLink_has_Snapshot_NodeLink1`
    FOREIGN KEY (`node_link_id` )
    REFERENCES `dcasecloud`.`node_link` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_NodeLink_has_Snapshot_Snapshot1`
    FOREIGN KEY (`snapshot_id` )
    REFERENCES `dcasecloud`.`snapshot` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`process_context_has_snapshot`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`process_context_has_snapshot` (
  `process_context_id` INT NOT NULL ,
  `snapshot_id` INT NOT NULL ,
  PRIMARY KEY (`process_context_id`, `snapshot_id`) ,
  INDEX `fk_process_context_has_snapshot_snapshot1_idx` (`snapshot_id` ASC) ,
  INDEX `fk_process_context_has_snapshot_process_context1_idx` (`process_context_id` ASC) ,
  CONSTRAINT `fk_process_context_has_snapshot_process_context1`
    FOREIGN KEY (`process_context_id` )
    REFERENCES `dcasecloud`.`process_context` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_process_context_has_snapshot_snapshot1`
    FOREIGN KEY (`snapshot_id` )
    REFERENCES `dcasecloud`.`snapshot` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`node_property`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`node_property` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `property_key` VARCHAR(127) NULL ,
  `property_value` TEXT NULL ,
  `node_data_id` INT NOT NULL ,
  PRIMARY KEY (`id`) ,
  INDEX `fk_node_property_node_data1_idx` (`node_data_id` ASC) ,
  CONSTRAINT `fk_node_property_node_data1`
    FOREIGN KEY (`node_data_id` )
    REFERENCES `dcasecloud`.`node_data` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `dcasecloud`.`argument_has_process_context`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `dcasecloud`.`argument_has_process_context` (
  `argument_id` INT NOT NULL ,
  `process_context_id` INT NOT NULL ,
  PRIMARY KEY (`argument_id`, `process_context_id`) ,
  INDEX `fk_argument_has_process_context_process_context1_idx` (`process_context_id` ASC) ,
  INDEX `fk_argument_has_process_context_argument1_idx` (`argument_id` ASC) ,
  CONSTRAINT `fk_argument_has_process_context_argument1`
    FOREIGN KEY (`argument_id` )
    REFERENCES `dcasecloud`.`argument` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_argument_has_process_context_process_context1`
    FOREIGN KEY (`process_context_id` )
    REFERENCES `dcasecloud`.`process_context` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
