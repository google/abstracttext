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

	public static function call($call, $lang) {
		$host = EneyjServer::HOST;
		$port = EneyjServer::PORT;
		$url = "http://$host:$port/?lang=$lang";
		$url .= '&call=' . urlencode($call);

		EneyjServer::ensureRunning();

		return file_get_contents($url);
	}
}
