# AbstractText - Docker Support

To build a container with the Mediawiki AbstractText support built in use
the Dockerfile in this directory.

```
> docker build -t repo/wikilambda .
```

This may take some time as it processes all the Z* files.

Then to run the resulting container use a standard docker command like:

```
docker run --name wikilambda -p 8081:80 -d -v "$PWD/..":/var/www/html/extensions/AbstractText repo/wikilambda
```

(the -v option replaces the version of AbstractText on the server with the local copy)

The wiki is then available at http://localhost:8081, with content for example at:

http://localhost:8081/index.php/M:67

