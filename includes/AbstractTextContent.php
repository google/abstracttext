<?php
// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

namespace AbstractText;

use JsonContent;
use Title;
use WikiPage;
use Revision;
use ContentHandler;
use ParserOptions;
use ParserOutput;
use FormatJson;
use MediaWiki\MediaWikiServices;

class AbstractTextContent extends JsonContent {
	private $linked_zobjects = array();
	private $type_data = array();
	private $zid;

	function __construct( $text ) {
		parent::__construct( $text, 'Aquinas' );
	}

	public function getParserOutput(
			Title $title,
			$revId = null,
			ParserOptions $options = null,
			$generateHtml = true
	) {
		$data = $this->getNativeData();

		global $wgLang;
		$lang = $wgLang->getCode();
		$zlang = 'Z251';
		if ($lang == 'de') $zlang = 'Z254';

		Helper::log( 'Call Meaning::display {l} {n}', [ 'l' => $lang, 'n' => $title->getText() ] );
		$wikitext = "__NOEDITSECTION__\n__NOTOC__\n";

		$title_name = $title->getText();
		$this->zid = $title_name;
		$wikitext .= EneyjServer::call("Z36($title_name)", $lang);

		$json = json_decode($data, true);
		$label = Helper::getLabel($json, $zlang);
		$zid = $json['Z1K2'];
		$label = is_null($label) ? $zid : $label;
		$wikitext .= "\n\n== $label ==\n";

		$typekeylabel = Helper::getKeylabel( 'Z1K1', $zlang );
		$typeid = $json['Z1K1'];
		$wikitext .= "$typekeylabel: ";
		$wikitext .= $this->getLinkText( $typeid, $zlang );
		$wikitext .= "\n\n";

		$this->type_data['type'] = $typeid;

		$descriptionlabel = Helper::getKeyLabel( 'Z1K4', $zlang );
		$description = Helper::getDescription($json, $zlang);
		if (!is_null($description)) {
		  $wikitext .= "$descriptionlabel: $description\n\n";
	  }
		// TODO: display aliases

    if ($typeid == "Z4") {
			$wikitext .= $this->getTypeDisplayText( $json, $zlang );
		} elseif ($typeid == "Z8") {
			$wikitext .= $this->getFunctionDisplayText( $json, $zlang, $lang, $title_name );
		} else {
			$defaultdisplaytext = $this->getDefaultDisplayText( $json, $zlang );
			if (!is_null($defaultdisplaytext)) {
				$wikitext .= $defaultdisplaytext;
			}
		}

		$parser = MediaWikiServices::getInstance()->getParser();
		$display = $parser->parse($wikitext, $title, $options, true, true, $revId )->getText();

    if ($json['Z1K1'] === 'Z8') {
			global $wgScriptPath;
      $display .= " <h2>Enter arguments</h2>\n <form action=\"$wgScriptPath/api.php\">\n";
      $display .= " <input type=\"hidden\" name=\"action\" value=\"abstracttext\">\n";
      $function_name = $title->getText();
      $display .= " <input type=\"hidden\" name=\"function\" value=\"$function_name\">\n";
      $n = 0;
      foreach ($json['Z8K1'] as $arg) {
        $n += 1;
        $display .= Helper::getLabel($arg, $zlang) . ": <input type=\"text\" name=\"arg$n\"> <br>\n";
      }
      $display .= " <input type=\"submit\" value=\"Submit\">\n </form>\n";
    }
    # /w/api.php?action=abstracttext&format=json&call=add(positive_integer(%222%22)%2C%20positive_integer(%222%22))

    $display .= "<h2>JSON data</h2>";

		$text = EneyjServer::labelize($zid, $lang);
		$json = FormatJson::decode( $text, true );
		$display .= $this->objectTable( $json );

		$display .= "<h2>Raw JSON data</h2>";

		$parserOutput = parent::getParserOutput( $title, $revId, $options, $generateHtml );
		$parserOutput->setText( $display . $parserOutput->getText() );
		$parserOutput->addModules( 'ext.abstractText' );
		$this->addZobjectLinks( $parserOutput );

		$this->updateTypeData($title_name);

		return $parserOutput;
	}

	public function getDefaultDisplayText($data, $zlang) {
		$result = "";
		if (!array_key_exists('Z1K1', $data)) return NULL;
		$typeobject = Helper::getZObject( $data['Z1K1'] );
		if (is_null($typeobject)) return NULL;
    if (!array_key_exists('Z4K2', $typeobject)) return NULL;
		foreach ($typeobject['Z4K2'] as $kobject) {
			if (!array_key_exists('Z1K2', $kobject)) continue;
			$kid = $kobject['Z1K2'];
			$klabel = Helper::getLabel( $kobject, $zlang );
			$klabel = is_null($klabel) ? $kid : $klabel;
			if (!array_key_exists($kid, $data)) continue;
			$result .= "$klabel: ";
			$result .= Helper::toString( $data[$kid] );
			$result .= "\n\n";
		}
		return $result;
	}

  // TODO: all display texts should register and be called dynamically
	// TODO: in fact, they should just be functions in Wikilambda itself
	public function getTypeDisplayText($data, $zlang) {
		$result = "";
		if (!array_key_exists('Z1K1', $data)) return NULL;
		$typeobject = Helper::getZObject( $data['Z1K1'] );
		if (is_null($typeobject)) return NULL;
    if (!array_key_exists('Z4K2', $typeobject)) return NULL;
		foreach ($typeobject['Z4K2'] as $kobject) {
			if (!array_key_exists('Z1K2', $kobject)) continue;
			if ($kobject['Z1K2'] == 'Z4K2') continue;
			$kid = $kobject['Z1K2'];
			$klabel = Helper::getLabel( $kobject, $zlang );
			$klabel = is_null($klabel) ? $kid : $klabel;
			if (!array_key_exists($kid, $data)) continue;
			$result .= "$klabel: ";
			$result .= Helper::toString( $data[$kid] );
			$result .= "\n\n";
		}
		$result .= "=== Keys ===\n";
		if (array_key_exists('Z4K2', $data)) {
		  foreach ($data['Z4K2'] as $kobject) {
  			if (!array_key_exists('Z1K2', $kobject)) continue;
	  		$kid = $kobject['Z1K2'];
		  	$klabel = Helper::getLabel( $kobject, $zlang );
			  $klabel = is_null($klabel) ? $kid : $klabel;
  			$result .= "==== $klabel ====\n";
	  		$descriptionlabel = Helper::getKeyLabel( 'Z1K4', $zlang );
		  	$description = Helper::getDescription($kobject, $zlang);
			  if (!is_null($description)) {
			    $result .= "$descriptionlabel: $description\n\n";
		    }
	  		$result .= "type: ''todo''\n\n"; // TODO
		  	$result .= "validators: ''todo''\n\n"; // TODO
			  // TODO: display aliases
		  }
	  }
		return $result;
	}

	public function getFunctionDisplayText($data, $zlang, $lang, $title_name) {
		$result = "";
		if (!array_key_exists('Z1K1', $data)) return NULL;

		if (array_key_exists('Z8K2', $data)) {
	  		$returntypezid = $data['Z8K2'];
			$result .= "return type: ";
			$result .= $this->getLinkText( $returntypezid, $zlang );
		  	$result .= "\n\n";
			$this->type_data['return_type'] = $returntypezid;
		}
		$this->type_data['arg_types'] = array();

		$argument_labels = array();
		$result .= "=== Arguments ===\n";
		if (array_key_exists('Z8K1', $data)) {
			foreach ($data['Z8K1'] as $kobject) {
				if (!array_key_exists('Z1K2', $kobject)) continue;
				$kid = $kobject['Z1K2'];
				$klabel = Helper::getLabel( $kobject, $zlang );
				$klabel = is_null($klabel) ? $kid : $klabel;
				$argument_labels[$kid] = $klabel;
				$result .= "==== $klabel ====\n";
				$descriptionlabel = Helper::getKeyLabel( 'Z1K4', $zlang );
				$description = Helper::getDescription($kobject, $zlang);
				if (!is_null($description)) {
					$result .= "$descriptionlabel: $description\n\n";
				}
				$argtypezid = 'Z1';
				if (array_key_exists('Z17K1', $kobject)) {
					$argtypezid = $kobject['Z17K1'];
				}
				$result .= "type: ";
				$result .= $this->getLinkText( $argtypezid, $zlang );
				$result .= "\n\n";

				$this->type_data['arg_types'][$argtypezid] = 1;

				// $result .= "validators: ''todo''\n\n"; // TODO
				// TODO: display aliases
			}
		}

		$result .= "=== Implementations ===\n";
		foreach ($data['Z8K4'] as $kobject) {
			$cid = $kobject['Z1K2'];
			$result .= "==== Implementation $cid ====\n";
			$impl = $kobject['Z14K1'];
			if ($impl['Z1K1'] == 'Z16') {
				$result .= $impl['Z16K1'];
				$result .= "\n\n<code>\n" . str_replace("\n", "\n\n", $impl['Z16K2']) . "\n</code>\n\n";
			} elseif ($impl['Z1K1'] == 'Z7') {
				$result .= $this->getFunctionCallDisplayText( $data, $impl, $zlang );
				$result .= "\n\n";
			} else {
				$result .= Helper::toString( $impl );
				$result .= "\n\n";
  			}
		}

		$result .= "=== Tests ===\n";

		if ( array_key_exists('Z8K3', $data) ) {
		    foreach ($data['Z8K3'] as $kobject) {
			$test_id = $kobject['Z1K2'];
			$result .= "\n==== Test $test_id ====\n";
			$test = $kobject['Z20K2'];
			$result .= $this->getLinkText( $test['Z1K1'], $zlang );
			foreach ($test AS $key => $value) {
				if ($key == 'Z1K1') continue;
				$valuelabel = $value;
				if (! is_array($value) ) {
					$valueobject = Helper::getZObject($value);
					if (! is_null($valueobject)) {
						$valuelabel = $this->getLinkText($value, $zlang);
					}
				} else {
					$valuelabel = Helper::toString($value);
				}
				if (array_key_exists($key, $argument_labels)) {
					$label = $argument_labels[$key];
					$result .= " $label: $valuelabel";
				} else {
					$result .= " $key: $valuelabel";
				}
			}
			$result .= ' - expected result: ';
			$expected = $kobject['Z20K3'];
			if (! is_array($expected) ) {
				if (substr($expected, 0, 1) == 'Z') {
					$result .= $this->getLinkText( $expected, $zlang );
				} else {
					$result .= "'" . $expected . "'";
				}
			} else {
				$result .= Helper::toString( $expected );
			}
			$result .= '<div class="test_result" data-testid="' . $test_id . '"></div>' ;
		    }
		}

		return $result;
	}

	public function getFunctionCallDisplayText( $data, $impl, $zlang ) {
		if ( $impl['Z1K1'] != 'Z7') return 'TODO';
		if (!array_key_exists('Z7K1', $impl)) return 'TODO';
		$result = '';
		if (! is_array($impl['Z7K1']) ) {
			$result .= $this->getLinkText( $impl['Z7K1'], $zlang );
		}
		$result .= '( ';

    $first = true;
		foreach ($impl as $key => $value) {
			if ($key === 'Z1K1') continue;
			if ($key === 'Z7K1') continue;
			if ($first) {
				$first = false;
			} else {
				$result .= ', ';
			}
			if (is_array( $value ) && array_key_exists('Z1K1', $value)) {
				if ($value['Z1K1'] == 'Z7') {
					$result .= $this->getFunctionCallDisplayText( $data, $value, $zlang );
			  } elseif ($value['Z1K1'] == 'Z18') {
					$name = NULL;
					foreach ($data['Z8K1'] as $kobject) {
						if (!array_key_exists('Z1K2', $kobject)) continue;
						$kid = $kobject['Z1K2'];
						if ($kid !== $value['Z18K1']) continue;
						$name = Helper::getLabel( $kobject, $zlang );
						$name = is_null($name) ? $kid : $name;
					}
					$result .= "''$name''";
				} else {
					$result .= 'TODO';
				}
			} else {
				if (is_array($value) ) {
					$result .= 'TODO';
				} else {
					$result .= $this->getLinkText( $value, $zlang );
				}
			}
		}

		$result .= ' )';

		return $result;
	}

	public function getLinkText( $zid, $zlang ) {
		$this->linked_zobjects[$zid] = 1;
		$label = Helper::zLabel( $zid, $zlang );
		$label = is_null($label) ? $zid : $label;
		return "[[M:$zid|$label]]";
	}

	public function addZobjectLinks( $parserOutput ) {
		foreach ( array_keys( $this->linked_zobjects ) as $zid ) {
			$ztitle = Title::newFromText( $zid, NS_MEANING );
			if ($ztitle == NULL) {
				error_log("Null title for linked id $zid");
			} else {
				$parserOutput->addLink( $ztitle );
			}
		}
	}

	// Update new database tables for this entry
	// This is really the wrong place for this, it probably
	// should be in a "Hook" somewhere. Also it won't handle
	// deleted entries correctly at all, they'll still be there!
	public function updateTypeData() {
		// Compare type data with what was previously stored
		$repo = new TypesRepo();
		$old_type_data = $repo->getObjectData( $this->zid );
		if ( $this->type_data != $old_type_data ) {
			$repo->updateObjectData($this->zid, $this->type_data);
		}
	}

	public function isValid() {
		if (!parent::isValid()) return false;

    // TODO add checks if wanted

		return true;
	}
}
