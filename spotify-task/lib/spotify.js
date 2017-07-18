const request = require('request'),
      _ = require('lodash')

const authorise = done => {
  const authorization = 'Basic ' +
        (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' +
                    process.env.SPOTIFY_SECRET).toString('base64'))
  const opts = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: authorization },
    form: { grant_type: 'client_credentials' },
    json: true
  }

  request.post(opts, (err, res, body) => done(err, body && body.access_token))
}

const getArtistAlbums = (id, token, done) => {
  const opts = {
    url: `https://api.spotify.com/v1/artists/${id}/albums`,
    headers: { Authorization: `Bearer ${token}` }
  }
  request.get(opts, (err, res, body) => {
    if (err) return done(err)

    body = JSON.parse(body)
    body.items = _.uniqBy(body.items, album => {
      return album.name
    })

    done(null, body)
  })
}

const searchArtists = (search, token, done) => {
  const opts = {
    url: `https://api.spotify.com/v1/search?type=artist&q=${search}`,
    headers: { Authorization: `Bearer ${token}` }
  }
  request.get(opts, (err, res, body) => {
    if (err) return done(err)

    body = JSON.parse(body)
    done(null, body)
  })
}

authorise((err, token) => {
  searchArtists('prodigy', token, (err, result) => {
    console.log(result.artists.items);
  })
})


module.exports = {
  authorise: authorise,
  getArtistAlbums: getArtistAlbums
}
