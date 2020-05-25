<?php

namespace AbstractText;

use SpecialPage;

class SpecialFunctionsByArguments extends SpecialPage {
	function __construct() {
		parent::__construct( 'FunctionsByArguments' );
	}

	function execute( $par ) {
		$request = $this->getRequest();
		$output = $this->getOutput();

		$this->setHeaders();
		$wikitext = '== List of functions based on argument types==';
		$output->addWikiTextAsInterface( $wikitext );
	}
}
