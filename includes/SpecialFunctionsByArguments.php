<?php

namespace AbstractText;

use SpecialPage;

class SpecialFunctionsByArguments extends SpecialPage {
	function __construct() {
		parent::__construct( 'FunctionsByArguments' );
	}

	function execute( $par ) {
		$output = $this->getOutput();
		$repo = new TypesRepo();

		$types_list = $repo->getTypes();

		$this->setHeaders();
		$wikitext = "== Available types ==\n";
		foreach ($types_list AS $type) {
			$wikitext .= "# [[Special:FunctionsByArguments/$type|$type]]\n";
		}
		if ( $par !== null ) {
			$wikitext .= "\n== List of objects with argument type $par ==\n";

			$zobjects_list = $repo->getObjectsByArgumentType($par);
			foreach ($zobjects_list AS $zobject) {
				$wikitext .= "# [[M:$zobject|$zobject]]\n";
			}
		}
		$output->addWikiTextAsInterface( $wikitext );
	}
}
