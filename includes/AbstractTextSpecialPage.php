<?php

// general query for matching objects

namespace AbstractText;

use SpecialPage;

class AbstractTextSpecialPage extends SpecialPage {

	protected function getTypes( $dbr ) {
		return $this->getObjectsByType( 'Z4', $dbr );
	}

	protected function getObjectsByType( $type, $dbr ) {
		$res = $dbr->select(
			'abstract_text_type',
			array('att_zobject'),
			array(
				'att_type' => $type,
				 'att_position' => '0'
			),
			__CLASS__ . '::getTypes'
		);
		$objects = array();
		foreach ($res as $row) {
			$objects[] = $row->att_zobject;
		}
		return $objects;
	}
}
