<?php

namespace AbstractText;

use SpecialPage;
use AbstractText\TypesRepo;

class SpecialObjectsByType extends SpecialPage {
	function __construct() {
		parent::__construct( 'ObjectsByType' );
	}

	function execute( $par ) {
		$output = $this->getOutput();
		$repo = new TypesRepo();

		$types_list = $repo->getTypes();

		$this->setHeaders();
		$wikitext = "== Available types ==\n";
		foreach ($types_list AS $type) {
			$wikitext .= "# [[Special:ObjectsByType/$type|$type]]\n";
		}
		if ( $par !== null ) {
			$wikitext .= "\n== List of objects of type $par ==\n";

			$zobjects_list = $repo->getObjectsByType($par);
			foreach ($zobjects_list AS $zobject) {
				$wikitext .= "# [[M:$zobject|$zobject]]\n";
			}
		}
		$output->addWikiTextAsInterface( $wikitext );
	}
}
