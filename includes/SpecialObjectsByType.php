<?php

namespace AbstractText;

use SpecialPage;

class SpecialObjectsByType extends SpecialPage {
	function __construct() {
		parent::__construct( 'ObjectsByType' );
	}

	function execute( $par ) {
		$request = $this->getRequest();
		$output = $this->getOutput();

		$this->setHeaders();
		$wikitext = '== List of objects by type ==';
		$output->addWikiTextAsInterface( $wikitext );
	}
}
