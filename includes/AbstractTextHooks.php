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

use ContentHandler;
use DatabaseUpdater;

class AbstractTextHooks {

	public static function onCodeEditorGetPageLanguage( $title, &$lang ) {
		if ( $title->getContentModel() === 'Aquinas' ) {
			$lang = 'json';
		}
		return true;
	}

	// Add table to store type relations for quick lookups
	public static function onLoadExtensionSchemaUpdates( $updater ) {
		$updater->addExtensionTable(
			'abstract_text_type',
			 __DIR__ . '/sql/create_types_table.sql'
		);
	}

	public static function addEditTab( $skinTemplate, &$links ) {
		$title = $skinTemplate->getTitle();
		$action = $skinTemplate->getRequest()->getVal( 'action' );
		$links['views']['newedit'] = array(
			'class' => ( $action == 'newedit') ? 'selected' : false,
			'text' => "New edit",
			'href' => $title->getLocalURL('action=newedit')
		);

		return true;
	}
}
