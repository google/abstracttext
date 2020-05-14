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

		if ( array_key_exists('getResults', $params) ) {
			if ($params['getResults']) {
				$this->getResultsData($params['function']);
				return;
			}
		}
		if ( array_key_exists('runATest', $params) ) {
			if ($params['runATest']) {
				$this->runTest($params['function'], $params['testId'], $params['implementationId']);
				return;
			}
		}
		$this->doZFunctionCall($params);
	}

	public function mustBePosted() {
		return false;
	}

	protected function doZFunctionCall($params) {
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
			'getResults' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'runATest' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'testId' => [
				ApiBase::PARAM_REQUIRED => false,
			],
			'implementationId' => [
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

	protected function getResultsData($zid) {
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'AbstractText' );
		$results_dir = $config->get( 'AbstractTextCalibrationPath' );
		$results_file = $results_dir . $zid . '.json';
		$results_data = file_get_contents($results_file);
		$results_array = json_decode($results_data, TRUE);
		$this->getResult()->addValue( null, $this->getModuleName(),
			$results_array);
	}

	protected function runTest($zid, $testId, $implementationId) {
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'AbstractText' );
		$script_path = $config->get( 'AbstractTextScriptPath' );
		$cmd = "node $script_path/../scripts/testOnce.js --json $zid $testId $implementationId";
		$result = shell_exec( $cmd );
		$results_array = json_decode($result, TRUE);
		$this->getResult()->addValue( null, 'testResults', $results_array);
	}
}
