<?php
 /*
 * Based on Mediawiki-Vagrant LocalSettings file...
 */

// Enable error reporting
error_reporting( -1 );
ini_set( 'display_errors', 1 );

$wgMaxShellMemory = 1024 * 512;

// Show the debug toolbar if 'debug' is set on the request, either as a
// parameter or a cookie.
if ( !empty( $_REQUEST['debug'] ) ) {
	$wgDebugToolbar = true;
}

// Expose debug info for PHP errors.
$wgShowExceptionDetails = true;

$logDir = '/var/log';
foreach ( [ 'exception', 'runJobs', 'JobQueueRedis' ] as $logGroup ) {
	$wgDebugLogGroups[$logGroup] = "{$logDir}/mediawiki-{$logGroup}.log";
}

// Calls to deprecated methods will trigger E_USER_DEPRECATED errors
// in the PHP error log.
$wgDevelopmentWarnings = true;

// Expose debug info for SQL errors.
$wgDebugDumpSql = true;
$wgShowDBErrorBacktrace = true;
$wgShowSQLErrors = true;

// Profiling
$wgDebugProfiling = false;

$wgUseInstantCommons = true;
$wgEnableUploads = true;

// User settings and permissions
$wgAllowUserJs = true;
$wgAllowUserCss = true;

$wgEnotifWatchlist = true;
$wgEnotifUserTalk = true;

// Eligibility for autoconfirmed group
$wgAutoConfirmAge = 3600 * 24; // one day
$wgAutoConfirmCount = 5; // five edits

$wgLegacyJavaScriptGlobals = false;
$wgEnableJavaScriptTest = true;

// Bug 73037: handmade gzipping sometimes makes error messages impossible to
// see in HHVM
$wgDisableOutputCompression = true;

// Don't gloss over errors in class name letter-case.
$wgAutoloadAttemptLowercase = false;

// Enable CORS between wikis. Ideally we'd limit this to wikis in the farm,
// but iterating resource names is super cumbersome in Puppet.
$wgCrossSiteAJAXdomains = [ '*' ];

// ====================================================================
// NOTE: anything after this point is 'immutable' config that can not be
// overridden by a role or a user managed file in settings.d
// ====================================================================

// XXX: Is this a bug in core? (ori-l, 27-Aug-2013)
$wgHooks['GetIP'][] = function ( &$ip ) {
	if ( PHP_SAPI === 'cli' ) {
		$ip = '127.0.0.1';
	}
	return true;
};

// Allow 'vagrant' password for all users regardless of password
// policies that are configured.
$wgHooks['isValidPassword'][] = function ( $password, &$result, $user ) {
	if ( $password === 'vagrant' ) {
		$result = true;
	}
	return true;
};

// Ensure that full LoggerFactory configuration is applied
MediaWiki\Logger\LoggerFactory::registerProvider(
	\Wikimedia\ObjectFactory::getObjectFromSpec( $wgMWLoggerDefaultSpi )
);
