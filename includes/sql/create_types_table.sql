
CREATE TABLE /*_*/abstract_text_type(
-- Primary key
att_id int unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,
-- zobject this type is from: Z999 etc.
att_zobject varchar(255) NOT NULL,
-- type: Z8 etc.
att_type varchar(255) NOT NULL,
-- type position: 0 = zobject type, 1 = return value, 2 = argument
att_position int unsigned NOT NULL
)/*$wgDBTableOptions*/;

CREATE INDEX /*i*/att_type_position ON /*_*/abstract_text_type (att_type,att_position);
