<?php

namespace AbstractText;

use AbstractText\AbstractTextSpecialPage ;

class SpecialObjectsByType extends AbstractTextSpecialPage {
	function __construct() {
		parent::__construct( 'ObjectsByType' );
	}

	function execute( $par ) {
		$output = $this->getOutput();
		$dbr = wfGetDB( DB_REPLICA );

		$types_list = $this->getTypes($dbr);

		$this->setHeaders();
		$wikitext = "== Available types ==\n";
		foreach ($types_list AS $type) {
			$wikitext .= "# [[Special:ObjectsByType/$type|$type]]\n";
		}
		if ( $par !== null ) {
			$wikitext .= "\n== List of objects of type $par ==\n";

			$zobjects_list = $this->getObjectsByType($par, $dbr);
			foreach ($zobjects_list AS $zobject) {
				$wikitext .= "# [[M:$zobject|$zobject]]\n";
			}
		}
		$output->addWikiTextAsInterface( $wikitext );
	}
}
