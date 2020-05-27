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

		global $wgLang;
		$lang = $wgLang->getCode();
		$zlang = 'Z251';
		if ($lang == 'de') $zlang = 'Z254';

		$types_list = $repo->getTypes();

		$this->setHeaders();
		$wikitext = '';
		if ( $par !== null && $par != '' ) {
			$parlabel = Helper::zLabel($par, $zlang);
			$wikitext .= "\n== Functions returning $parlabel ($par) objects ==\n";
			$wikitext .= "<div class='at-zlist'><ul>\n";

			$zobjects_list = $repo->getObjectsByReturnType($par);
			foreach ($zobjects_list AS $zobject) {
				$label = Helper::zLabel($zobject, $zlang);
				$wikitext .= "<li>[[M:$zobject|$label]] ($zobject)</li>\n";
			}
			$wikitext .= "</ul></div>\n";
		}
		$wikitext .= "== Types ==\n";
		$wikitext .= "<div class='at-typelist'><ul>\n";
		foreach ($types_list AS $type) {
			$label = Helper::zLabel($type, $zlang);
			$wikitext .= "<li>[[Special:FunctionsByReturnType/$type|$label]] ($type)</li>\n";
		}
		$wikitext .= "</ul></div>\n";
		$output->addWikiTextAsInterface( $wikitext );
		$output->addModules( 'ext.abstractText' );
	}
}
