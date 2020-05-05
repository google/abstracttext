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

		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'AbstractText' );
		$script_path = $config->get( 'AbstractTextScriptPath' );
		$murl = $config->get( 'AbstractTextDataPath' );

    // TODO this is a major security leak that should never be deployed
    // TODO it can easily execute any arbitrary code on your machine
    // TODO and returns and displays the result
    $data_arg = escapeshellarg($data);
		$title_name = $title->getText();

    $cmd = "node $script_path --lang:$lang --http $murl 'Z36($title_name)'";
    $wikitext .= shell_exec( $cmd );
		$json = json_decode($data, true);
		$label = $this->getLabel($json, $zlang);
		$zid = $json['Z1K2'];
		$label = is_null($label) ? $zid : $label;
		$wikitext .= "\n\n== $label ==\n";

		$typekeylabel = $this->getKeylabel( 'Z1K1', $zlang );
		$typeid = $json['Z1K1'];
		$typeobject = $this->getZObject( $typeid );
		$typelabel = $this->getLabel( $typeobject, $zlang );
		$typelabel = is_null($typelabel) ? $typeid : $typelabel;
		$wikitext .= "$typekeylabel: [[M:$typeid|$typelabel]]\n\n";

		$descriptionlabel = $this->getKeyLabel( 'Z1K4', $zlang );
		$description = $this->getDescription($json, $zlang);
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

		global $wgParser;
		$display = $wgParser->parse($wikitext, $title, $options, true, true, $revId )->getText();

    if ($json['Z1K1'] === 'Z8') {
			global $wgScriptPath;
      $display .= " <h2>Enter arguments</h2>\n <form action=\"$wgScriptPath/api.php\">\n";
      $display .= " <input type=\"hidden\" name=\"action\" value=\"abstracttext\">\n";
      $function_name = $title->getText();
      $display .= " <input type=\"hidden\" name=\"function\" value=\"$function_name\">\n";
      $n = 0;
      foreach ($json['Z8K1'] as $arg) {
        $n += 1;
        $display .= $this->getLabel($arg, $zlang) . ": <input type=\"text\" name=\"arg$n\"> <br>\n";
      }
      $display .= " <input type=\"submit\" value=\"Submit\">\n </form>\n";
    }
    # /w/api.php?action=abstracttext&format=json&call=add(positive_integer(%222%22)%2C%20positive_integer(%222%22))

    $display .= "<h2>JSON data</h2>";

		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'AbstractText' );
		$script_path = $config->get( 'AbstractTextScriptPath' );

		$cmd = "node $script_path --labellang:$lang --labelize --nocolor $zid";
		$text = shell_exec( $cmd );
		$json = FormatJson::decode( $text, true );
		$display .= $this->objectTable( $json );

		$display .= "<h2>Raw JSON data</h2>";

		$parserOutput = parent::getParserOutput( $title, $revId, $options, $generateHtml );
		$parserOutput->setText( $display . $parserOutput->getText() );
		return $parserOutput;
	}

	public function getMultilingualTextValue($key, $data, $zlang) {
		if ($data == NULL) return NULL;
		if (!array_key_exists($key, $data)) return NULL;
		if (!array_key_exists('Z12K1', $data[$key])) return NULL;
		foreach ($data[$key]['Z12K1'] as $label)
		  if ($label['Z11K1'] == $zlang)
				return $label['Z11K2'];
		$lang = $data[$key]['Z12K1'][0]['Z11K1'];
		if ($lang == 'Z251') $lang = 'en';
		if ($lang == 'Z254') $lang = 'de';
		return $data[$key]['Z12K1'][0]['Z11K2'] . '<sub>' . $lang . '</sub>';
	}

	public function getLabel($data, $zlang) {
		return $this->getMultilingualTextValue('Z1K3', $data, $zlang);
	}

	public function getDescription($data, $zlang) {
		return $this->getMultilingualTextValue('Z1K4', $data, $zlang);
	}

	public function getZObject($zname) {
		$ztitle = Title::newFromText( $zname, NS_MEANING );
		$zwp = WikiPage::factory( $ztitle );
		$zrev = $zwp->getRevision();
		if ($zrev == NULL) return NULL;
		$zcontent = $zrev->getContent( Revision::RAW );
		$ztext = ContentHandler::getContentText( $zcontent );
		$json = json_decode($ztext, true);
		return $json;
	}

	public function getKeylabel($keyid, $zlang) {
		$kpos = strpos($keyid, 'K');
		$zid = substr($keyid, 0, $kpos);
		$kid = substr($keyid, $kpos);
		$zobject = $this->getZObject($zid);

		if (!array_key_exists('Z4K2', $zobject)) return $keyid;
		foreach ($zobject['Z4K2'] as $kobject) {
			if ($kobject['Z1K2'] == $keyid) {
				$klabel = $this->getLabel( $kobject, $zlang );
				return is_null($klabel) ? $keyid : $klabel;
			}
		}
		return 'tttype';
		return $keyid;
	}

	public function getDefaultDisplayText($data, $zlang) {
		$result = "";
		if (!array_key_exists('Z1K1', $data)) return NULL;
		$typeobject = $this->getZObject( $data['Z1K1'] );
		if (is_null($typeobject)) return NULL;
    if (!array_key_exists('Z4K2', $typeobject)) return NULL;
		foreach ($typeobject['Z4K2'] as $kobject) {
			if (!array_key_exists('Z1K2', $kobject)) continue;
			$kid = $kobject['Z1K2'];
			$klabel = $this->getLabel( $kobject, $zlang );
			$klabel = is_null($klabel) ? $kid : $klabel;
			if (!array_key_exists($kid, $data)) continue;
			$result .= "$klabel: $data[$kid]\n\n";
		}
		return $result;
	}

  // TODO: all display texts should register and be called dynamically
	// TODO: in fact, they should just be functions in Wikilambda itself
	public function getTypeDisplayText($data, $zlang) {
		$result = "";
		if (!array_key_exists('Z1K1', $data)) return NULL;
		$typeobject = $this->getZObject( $data['Z1K1'] );
		if (is_null($typeobject)) return NULL;
    if (!array_key_exists('Z4K2', $typeobject)) return NULL;
		foreach ($typeobject['Z4K2'] as $kobject) {
			if (!array_key_exists('Z1K2', $kobject)) continue;
			if ($kobject['Z1K2'] == 'Z4K2') continue;
			$kid = $kobject['Z1K2'];
			$klabel = $this->getLabel( $kobject, $zlang );
			$klabel = is_null($klabel) ? $kid : $klabel;
			if (!array_key_exists($kid, $data)) continue;
			$result .= "$klabel: $data[$kid]\n\n";
		}
		$result .= "=== Keys ===\n";
		if (array_key_exists('Z4K2', $data)) {
		  foreach ($data['Z4K2'] as $kobject) {
  			if (!array_key_exists('Z1K2', $kobject)) continue;
	  		$kid = $kobject['Z1K2'];
		  	$klabel = $this->getLabel( $kobject, $zlang );
			  $klabel = is_null($klabel) ? $kid : $klabel;
  			$result .= "==== $klabel ====\n";
	  		$descriptionlabel = $this->getKeyLabel( 'Z1K4', $zlang );
		  	$description = $this->getDescription($kobject, $zlang);
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
		$typeobject = $this->getZObject( $data['Z1K1'] );
		if (is_null($typeobject)) return NULL;
		if (!array_key_exists('Z4K2', $typeobject)) return NULL;
		// TODO: tests

    if (array_key_exists('Z8K2', $data)) {
  		$returntypezid = $data['Z8K2'];
	  	$returntype = $this->getZObject( $returntypezid );
		  $returnlabel = $this->getLabel( $returntype, $zlang );
  		$returnlabel = is_null($returnlabel) ? $returntypezid : $returnlabel;
	  	$result .= "return type: [[M:$returntypezid|$returnlabel]]\n\n"; // TODO
		}

		$result .= "=== Arguments ===\n";
		if (array_key_exists('Z8K1', $data)) {
			foreach ($data['Z8K1'] as $kobject) {
				if (!array_key_exists('Z1K2', $kobject)) continue;
				$kid = $kobject['Z1K2'];
				$klabel = $this->getLabel( $kobject, $zlang );
				$klabel = is_null($klabel) ? $kid : $klabel;
				$result .= "==== $klabel ====\n";
				$descriptionlabel = $this->getKeyLabel( 'Z1K4', $zlang );
				$description = $this->getDescription($kobject, $zlang);
				if (!is_null($description)) {
					$result .= "$descriptionlabel: $description\n\n";
				}
				if (array_key_exists('Z17K1', $kobject)) {
					$argtypezid = $kobject['Z17K1'];
					$argtype = $this->getZObject( $argtypezid );
					$arglabel = $this->getLabel( $argtype, $zlang );
					$arglabel = is_null($arglabel) ? $argtypezid : $arglabel;
					$result .= "type: [[M:$argtypezid|$arglabel]]\n\n"; // TODO
				} else {
					$result .= "type: [[M:Z1|zobject]]\n\n"; // TODO
				}
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

		return $result;
  }

	public function getFunctionCallDisplayText( $data, $impl, $zlang ) {
		if ( $impl['Z1K1'] != 'Z7') return 'TODO';
		if (!array_key_exists('Z7K1', $impl)) return 'TODO';
		$result = $this->getLinkText( $impl['Z7K1'], $zlang );
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
			if (is_array( $value )) {
				if ($value['Z1K1'] == 'Z7') {
					$result .= $this->getFunctionCallDisplayText( $data, $value, $zlang );
			  } elseif ($value['Z1K1'] == 'Z18') {
					$name = NULL;
					foreach ($data['Z8K1'] as $kobject) {
						if (!array_key_exists('Z1K2', $kobject)) continue;
						$kid = $kobject['Z1K2'];
						if ($kid !== $value['Z18K1']) continue;
						$name = $this->getLabel( $kobject, $zlang );
						$name = is_null($name) ? $kid : $name;
					}
					$result .= "''$name''";
				} else {
					$result .= 'TODO';
				}
			} else {
				$result .= $this->getLinkText( $value, $zlang );
			}
		}

		$result .= ' )';

		return $result;
	}

	public function getLinkText( $zid, $zlang ) {
		$zobj = $this->getZObject( $zid );
		$label = $this->getLabel( $zobj, $zlang );
		$label = is_null($label) ? $zid : $label;
		return "[[M:$zid|$label]]";
	}

	public function isValid() {
		if (!parent::isValid()) return false;

    // TODO add checks if wanted

		return true;
	}
}
