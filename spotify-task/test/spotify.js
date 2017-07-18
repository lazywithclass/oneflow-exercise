const spotify = require('../lib/spotify'),
      sinon  = require('sinon'),
      request = require('request'),
      should = require('should')

describe('authorise', () => {

  beforeEach(() => {
    sinon.stub(request, 'post').yields(null, null, {
      access_token: 'the token'
    })
  })

  afterEach(() => {
    request.post.restore()
  })

  it('gives back the token', done => {
    spotify.authorise(function(err, token) {
      token.should.equal('the token')
      done()
    })
  })

  it('uses credentials from the environment', done => {
    process.env.SPOTIFY_CLIENT_ID = 'clientid'
    process.env.SPOTIFY_SECRET = 'secret'

    spotify.authorise(function(err, token) {
      const authorization = 'Basic ' +
            (new Buffer('clientid:secret').toString('base64'))
      request.post.args[0][0].headers.Authorization
        .should.equal(authorization)
      done()
    })
  })

  it('fails if request fails', done => {
    request.post.yields('err')
    spotify.authorise(function(err, token) {
      err.should.equal('err')
      should(token).equal(undefined)
      done()
    })
  })

});

describe('getArtistAlbums', () => {

  beforeEach(() => {
    sinon.stub(request, 'get').yields(null, null, {
      items: [
        { name: 'Ride The Lightning' },
        { name: 'Master Of Puppets' }
      ]
    })
  })

  afterEach(() => {
    request.get.restore()
  })

  it('gives back albums', done => {
    spotify.getArtistAlbums('artist id', 'the token', (err, albums) => {
      albums.items.should.eql([
        { name: 'Ride The Lightning' },
        { name: 'Master Of Puppets' }
      ])
      done()
    })
  });

});
