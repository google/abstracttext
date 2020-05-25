<?php

namespace AbstractText;

use SpecialPage;

class SpecialFunctionsByReturnType extends SpecialPage {
	function __construct() {
		parent::__construct( 'FunctionsByReturnType' );
	}

	function execute( $par ) {
		$request = $this->getRequest();
		$output = $this->getOutput();

		$this->setHeaders();
		$wikitext = '== List of functions based on return type ==';
		$output->addWikiTextAsInterface( $wikitext );
	}
}
