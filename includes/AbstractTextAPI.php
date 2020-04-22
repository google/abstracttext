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

use MediaWiki\MediaWikiServices;

/**
 * Class AbstractTextApi
 *
 * Implements action=abstracttext to provide execution.
 *
 * As eneyj is functional, we use GET so it can be cached at varnish levels
 * very easily.
 */
class AbstractTextAPI extends ApiBase {

	public function execute() {
		$params = $this->extractRequestParams();

		$function = $params['function'];
		$arg1 = $params['arg1'];
		$arg2 = $params['arg2'];
    $arg3 = $params['arg3'];

		// TODO this needs to be fixed
    $call = "$function(Z70(\"$arg1\"), Z70(\"$arg2\"))";

    // TODO needs to be moved to configuration file and documented
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'AbstractText' );
		$script_path = $config->get( 'AbstractTextScriptPath' );
		$murl = $config->get( 'AbstractTextDataPath' );

    $call_arg = escapeshellarg($call);

//    $cmd = "node $script_path --http $murl $lang $data_arg";
    $cmd = "node $script_path $call_arg";
		// TODO this is a major security leak that should never be deployed
    // TODO it can easily execute any arbitrary code on your machine
    // TODO and returns and displays the result
		// TODO it is for now switched off
    $result = shell_exec( $cmd );
		// $result = 'deactived';

		$this->getResult()->addValue(
      null,
      $this->getModuleName(),
			[
        'call'  => $call,
        'result' => trim($result)
      ]
		);
	}

	public function mustBePosted() {
		return false;
	}

	protected function getAllowedParams() {
		return [
			'function' => [
				ApiBase::PARAM_REQUIRED => true,
			],
			'arg1' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'arg2' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'arg3' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'arg4' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'arg5' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'arg6' => [
				ApiBase::PARAM_REQUIRED => false,
			],
		];
	}

	public function getExamplesMessages() {
		return [
			'action=abstracttext&function=add&arg1=2&arg2=2'
				=> 'apihelp-abstracttext-example-1',
		];
	}
}
