## Spotify task

This is where I wrote the Spotify client.

### Configuration

This has been tested with node v8.0.0, which is the current stable at the time I
am writing this.

```bash
# install dependencies
$ npm install
```

```bash
# check if server side tests pass
$ npm test
```

### Running it

```bash
# start the server
$ SPOTIFY_CLIENT_ID=$CLIENTID SPOTIFY_SECRET=$SECRET start

# build the project so that changes are picked up on the fly
# and start a simple dev webserver
$ cd web && npm run dev
```

`$CLIENTID` and `$SERVER` are keys from the app I've created to access Spotify's
APIs, they should be in the email I've sent you.

Navigate to http://localhost:8080/#/home to see the albums.

### TODO

I feel there are at least two other features that could be added:

 * infinite scrolling on an artist album list
 * search for artists to get their id
