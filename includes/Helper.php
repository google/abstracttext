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
}
