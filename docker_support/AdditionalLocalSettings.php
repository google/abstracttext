include_once 'DockerLocalSettings.php';

$wgCacheEpoch = max( $wgCacheEpoch, gmdate( 'YmdHis' ) );
wfLoadExtension( 'UniversalLanguageSelector' );
wfLoadExtension( 'AbstractText' );
wfLoadSkin( 'Vector' );
