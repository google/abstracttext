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

		$zlang = Helper::zLang();

		$this->setHeaders();
		$wikitext = '';
		if ( $par !== null && $par != '' ) {
			$parlabel = Helper::zLabel($par, $zlang);
			$wikitext .= "\n== Functions with $parlabel ($par) argument(s) ==\n";
			$wikitext .= "<div class='at-zlist'><ul>\n";

			$zobjects_list = $repo->getObjectsByArgumentType($par);
			$zobjects_list = Helper::sorted_labeled_list($zobjects_list, $zlang);
			foreach ($zobjects_list AS $zobject => $label) {
				$wikitext .= "<li>[[M:$zobject|$label]] ($zobject)</li>\n";
			}
			$wikitext .= "</ul></div>\n";
		}

		$types_list = $repo->getTypes();
		$types_list = Helper::sorted_labeled_list($types_list, $zlang);

		$wikitext .= "== Types ==\n";
		$wikitext .= "<div class='at-typelist'><ul>\n";
		foreach ($types_list AS $type => $label) {
			$wikitext .= "<li>[[Special:FunctionsByArguments/$type|$label]] ($type)</li>\n";
		}
		$wikitext .= "</ul></div>\n";
		$output->addWikiTextAsInterface( $wikitext );
		$output->addModules( 'ext.abstractText' );
	}
}
