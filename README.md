# AbstractText

Extension to handle multilingual content in MediaWiki.
The content is represented in an abstract notation.
Language-specific renderers translate the abstract content to natural language.

This is not an officially supported Google product.

This is a prototype.
Do *not* use in a public installation.
This prototype has severe security issues.

This prototype is meant as a technology exploration for Wikilambda.
Wikilambda is described in the following paper:
*  [https://arxiv.org/abs/2004.04733](https://arxiv.org/abs/2004.04733)

The easiest intro is probably reading the [walkthrough](eneyj/docs/walkthrough.md).

An alternate implementation for eneyj: [graaleneyj](https://github.com/lucaswerkmeister/graaleneyj)

## Example

The simplest example for testing this is from the command line.
Try it out:

```
> node eneyj/src/eneyj.js --lang:en 'negate(false)'
true

> node eneyj/src/eneyj.js --lang:en 'subclassification_string_from_n_n_language(n_wikipedia, n_encyclopedia, English)'
Wikipedias are encyclopedias.

> node eneyj/src/eneyj.js --lang:en 'subclassification_string_from_n_n_language(n_wikipedia, n_encyclopedia, German)'
Wikipedien sind Enzyklopädien.
```

## Installation

AbstractText is a light-weight wrapper to allow access to eneyj (see there).
AbstractText and eneyj are both not very polished.
eneyj is the JavaScript code that actually evaluates the the functions.
If you want to get a feel for the code, try eneyj from the command line first.

If using Vagrant:
Need to add:
  `config.vm.boot_timeout = 600`
in line 54 or so in Vagrantfile

Installation:
Drop the files in the extensions folder.
Also add the files from UniversalLanguageSelector.

Also:
`vagrant roles enable codeeditor`

Add to LocalSettings:

```PHP
include_once '/vagrant/LocalSettings.php';

$wgCacheEpoch = max( $wgCacheEpoch, gmdate( 'YmdHis' ) );
wfLoadExtension( 'UniversalLanguageSelector' );
wfLoadExtension( 'AbstractText' );
```

to start:
```
cd ~/vagrant
vagrant up
vagrant ssh
```

To load the data that is alreday available:

```
php mediawiki/maintenance/importTextFiles.php -s "Import data" --prefix "M:" --overwrite abstracttext/eneyj/data/Z*
```

See logs:

```
tail /vagrant/logs/mediawiki-wiki-debug.log
grep AbstractText /vagrant/logs/mediawiki-wiki-debug.log | tail
```

Run tests (currently there are no tests for the extension):

```
sudo -u www-data hhvm /vagrant/mediawiki/tests/phpunit/phpunit.php --wiki wiki /vagrant/mediawiki/extensions/AbstractText/tests/phpunit/
```

Run specific test:

```
sudo -u www-data hhvm /vagrant/mediawiki/tests/phpunit/phpunit.php --wiki wiki --filter testConcatenateCallFallback /vagrant/mediawiki/extensions/AbstractText/tests/phpunit/
```

(see also the [README in eneyj](eneyj/README.md))
