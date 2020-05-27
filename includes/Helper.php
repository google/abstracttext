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

use Title;
use WikiPage;
use Revision;
use ContentHandler;

use MediaWiki\Logger\LoggerFactory;

class Helper {
	public static function toString( $obj ) {
		ob_start();
		var_dump($obj);
		$result = ob_get_clean();
		return $result;
	}

	public static function log( $message, $context ) {
		LoggerFactory::getInstance( 'AbstractText' )->info( $message, $context );
	}

	public static function zLabel($zid, $zlang) {
		$zobject = Helper::getZObject($zid);
		$label = Helper::getLabel($zobject, $zlang);
		if ($label == NULL) $label = $zid;
		return $label;
	}

	public static function getZObject($zname) {
		$ztitle = Title::newFromText( $zname, NS_MEANING );
		if ($ztitle == NULL) return NULL;
		$zwp = WikiPage::factory( $ztitle );
		$zrev = $zwp->getRevision();
		if ($zrev == NULL) return NULL;
		$zcontent = $zrev->getContent( Revision::RAW );
		$ztext = ContentHandler::getContentText( $zcontent );
		$json = json_decode($ztext, true);
		return $json;
	}

	public static function getLabel($data, $zlang) {
		return Helper::getMultilingualTextValue('Z1K3', $data, $zlang);
	}

	public static function getDescription($data, $zlang) {
		return Helper::getMultilingualTextValue('Z1K4', $data, $zlang);
	}

	public static function getMultilingualTextValue($key, $data, $zlang) {
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

	public static function sorted_labeled_list ($zid_list, $zlang) {
		$labels = [];
		foreach ($zid_list AS $zid) {
			$labels[$zid] = Helper::zLabel($zid, $zlang);
		}
		asort($labels);

		return $labels;
	}

	public static function zLang () {
		global $wgLang;
		$lang = $wgLang->getCode();
		$zlang = 'Z251';
		if ($lang == 'de') $zlang = 'Z254';

		return $zlang;
	}
}
