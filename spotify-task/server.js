const express = require('express'),
      app = express(),
      spotify = require('./lib/spotify')

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

function tokenIsExpired(result) {
  return result && result.error && result.error.status === 401
}

app.get('/api/albums/:artist', (req, res) => {

  function fetch() {
    spotify.getArtistAlbums(req.params.artist, app.get('token'), (err, result) => {
      if (tokenIsExpired(result)) {
        spotify.authorise((err, token) => {
          app.set('token', token)
          fetch()
        })
      } else {
        res.json(result)
      }
    })
  }

  fetch()
})

app.listen(3000)
