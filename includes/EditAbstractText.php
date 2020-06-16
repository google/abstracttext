<?php
namespace AbstractText;

use CommentStoreComment;
use ContentHandler;
use Action;
use MediaWiki\Revision\SlotRecord;

class EditAbstractText extends Action {
	public function getName() {
		return 'newedit';
	}

	protected function getDescription() {
		return 'Editing ZObjects';
	}

	public function show() {
		$output = $this->getOutput();
		$output->addModules( 'ext.abstractText.editor' );

		$title = $this->page->getTitle();
		$page_zid = $title->getText();

		if (false) { // form submitted - do something with request
			$request_data = $this->getRequest()->getValues();
			print_r($request_data);
		}

		$output->addHtml("<h2> Edit $page_zid </h2>");

		$zobject = Helper::getZObject($page_zid);
		$zlang = Helper::zLang();

		$repo = new TypesRepo();
		$types_list = $repo->getTypes();
		$types_list = Helper::sorted_labeled_list($types_list, $zlang);
		$lang_list = $repo->getObjectsByType( 'Z180' );
		$lang_list = Helper::sorted_labeled_list($lang_list, $zlang);

		$key_labels = array();
		$key_labels['Z1K1'] = Helper::getKeylabel( 'Z1K1', $zlang );
		$key_labels['Z1K3'] = Helper::getKeylabel( 'Z1K3', $zlang );
		$key_labels['Z1K4'] = Helper::getKeylabel( 'Z1K4', $zlang );
		$key_labels['Z1K5'] = Helper::getKeylabel( 'Z1K5', $zlang );
		$key_labels['Z1K6'] = Helper::getKeylabel( 'Z1K6', $zlang );

		$this->collect_key_labels($zobject, $key_labels, $zlang);

		$output->addJsConfigVars( ['zobject' => $zobject,
			'zlang' => $zlang,
			'ztypes' => $types_list,
			'zlanguages' => $lang_list,
			'zkeylabels' => $key_labels] );

		// Vue app element 
		$output->addHtml("<div id='zobject-editor'></div>");
	}

	private function collect_key_labels($zobject, &$key_labels, $zlang) {
		foreach ($zobject AS $key => $value) {
			if (! array_key_exists($key, $key_labels) ) {
				$key_labels[$key] = Helper::getKeyLabel($key, $zlang);
			}
			if ( is_array($value) ) {
				$this->collect_key_labels($value, $key_labels, $zlang);
			}
		}
	}

	public function doesWrites() {
		return true;
	}
}
