<?php

namespace AbstractText;

use MediaWiki\MediaWikiServices;

class EneyjServer {
	const HOST = 'localhost';
	const PORT = 3000;

	public static function serverRunning() {
		$connection = @fsockopen(EneyjServer::HOST, EneyjServer::PORT);
		if (is_resource($connection)) {
			fclose($connection);
			return TRUE;
		}
		return FALSE;
	}

	public static function ensureRunning() {
		if (! EneyjServer::serverRunning() ) {
			EneyjServer::startServer();
		}
	}

	private static function startServer() {
		$config = MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'AbstractText' );
		$script_path = $config->get( 'AbstractTextScriptPath' );
    		$cmd = "nohup setsid node $script_path --server > /dev/null 2>&1 &";
    		shell_exec( $cmd );
	}

// call() returns a php string or associative array (decoded from JSON)
	public static function call($call, $lang) {
		$host = EneyjServer::HOST;
		$port = EneyjServer::PORT;
		$url = "http://$host:$port/?lang=$lang";
		$url .= '&call=' . urlencode($call);

		EneyjServer::ensureRunning();

		$url_contents = EneyjServer::fetch_url_with_retry($url);

		$result = json_decode($url_contents, true);
		if (is_array($result)) { // probably an error?
			$result = "ERROR?: " . Helper::toString($result);
		}
		return $result;
	}

// labelize() returns a string (JSON encoded)
	public static function labelize($zid, $lang) {
		$host = EneyjServer::HOST;
		$port = EneyjServer::PORT;
		$url = "http://$host:$port/?labelize=true&lang=$lang";
		$url .= '&call=' . urlencode($zid);

		EneyjServer::ensureRunning();

		$url_contents = EneyjServer::fetch_url_with_retry($url);
		return $url_contents;
	}

	private static function fetch_url_with_retry($url) {
		$retries = 12;
		$retry_delay = 2; // seconds to wait before retrying
		while ($retries > 0) {
			$response = @file_get_contents($url);
			if ($response != false) {
				return($response);
			}
			sleep($retry_delay);
			$retries -= 1;
		}
		return null;
	}
}
