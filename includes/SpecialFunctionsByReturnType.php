<?php

namespace AbstractText;

use SpecialPage;
use AbstractText\TypesRepo;

class SpecialFunctionsByReturnType extends SpecialPage {
	function __construct() {
		parent::__construct( 'FunctionsByReturnType' );
	}

	function execute( $par ) {
		$output = $this->getOutput();
		$repo = new TypesRepo();

		$types_list = $repo->getTypes();

		$this->setHeaders();
		$wikitext = "== Available types ==\n";
		foreach ($types_list AS $type) {
			$wikitext .= "# [[Special:FunctionsByReturnType/$type|$type]]\n";
		}
		if ( $par !== null ) {
			$wikitext .= "\n== List of objects with return type $par ==\n";

			$zobjects_list = $repo->getObjectsByReturnType($par);
			foreach ($zobjects_list AS $zobject) {
				$wikitext .= "# [[M:$zobject|$zobject]]\n";
			}
		}
		$output->addWikiTextAsInterface( $wikitext );
	}
}
