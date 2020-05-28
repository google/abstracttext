<?php

// Manage object-type relations in database

namespace AbstractText;

class TypesRepo {
	private $dbr;

	function __construct() {
		$this->dbr = wfGetDB( DB_REPLICA );
	}

	public function getTypes() {
		return $this->getObjectsByType( 'Z4' );
	}

	public function getObjectsByType( $type ) {
		return $this->getObjectsByTypeAndPosition($type, 0);
	}

	public function getObjectsByReturnType( $type ) {
		return $this->getObjectsByTypeAndPosition($type, 1);
	}

	public function getObjectsByArgumentType( $type ) {
		return $this->getObjectsByTypeAndPosition($type, 2);
	}

	public function getObjectsByTypeAndPosition( $type, $position ) {
		$res = $this->dbr->select(
			'abstract_text_type',
			array('att_zobject'),
			array(
				'att_type' => $type,
				'att_position' => $position
			),
			__CLASS__ . '::getObjectsByType'
		);
		$objects = array();
		foreach ($res as $row) {
			$objects[] = $row->att_zobject;
		}
		return $objects;
	}

	public function getObjectData( $zid ) {
		$res = $this->dbr->select(
			'abstract_text_type',
			array('att_type', 'att_position'),
			array(
				'att_zobject' => $zid
			),
			__CLASS__ . '::getObjectData'
		);
		$type_data = array();
		foreach ($res as $row) {
			$pos = $row->att_position;
			if ($pos == 0) {
				$type_data['type'] = $row->att_type;
			} else if ($pos == 1) {
				$type_data['return_type'] = $row->att_type;
			} else {
				if (! array_key_exists('arg_types', $type_data) ) {
					$type_data['arg_types'] = array();
				}
				$type_data['arg_types'][$row->att_type] = 1;
			}
		}
		return $type_data;
	}

	public function updateObjectData($zid, $type_data) {
		$insert_rows = array();
		if (array_key_exists('type', $type_data)) {
			$insert_rows[] = [0, $type_data['type']];
		}
		if (array_key_exists('return_type', $type_data)) {
			$insert_rows[] = [1, $type_data['return_type']];
		}
		if (array_key_exists('arg_types', $type_data)) {
			foreach (array_keys($type_data['arg_types']) AS $arg_type) {
				$insert_rows[] = [2, $arg_type];
			}
		}

		$dbw = wfGetDB( DB_MASTER );
		$dbw->delete(
			'abstract_text_type',
			array(
				'att_zobject' => $zid,
			),
			__CLASS__ . '::updateObjectData'
		);
		foreach ($insert_rows AS $insert_row) {
			$dbw->insert(
				'abstract_text_type',
				array(
					'att_zobject' => $zid,
					'att_type' => $insert_row[1],
					'att_position' => $insert_row[0]
				),
				__CLASS__ . '::updateObjectData'
			);
		}
	}
}
