// I've annotated the source with comments

exports.inviteUser = function(req, res) {

  var invitationBody = req.body;
  var shopId = req.params.shopId;
  var authUrl = "https://url.to.auth.system.com/invitation";

  superagent
    .post(authUrl)
  // we are sending whatever body we are receiving, no validation is happening here,
  // it might be a good idea though, because if `invitationBody` is invalid we could
  // stop here instead of giving load to another service with a request we know
  // contains invalid data
    .send(invitationBody)
    .end(function(err, invitationResponse) {
      // no error handling
      if (invitationResponse.status === 201) {
        User.findOneAndUpdate({
          authId: invitationResponse.body.authId
        }, {
          // why do we update authId with the same value?
          authId: invitationResponse.body.authId,
          email: invitationBody.email
        }, {
          upsert: true,
          new: true
        }, function(err, createdUser) {
          // no error handling
          Shop.findById(shopId).exec(function(err, shop) {
            if (err || !shop) {
              // the status code is wrong if no shop is found, in that case it should be 404
              return res.status(500).send(err || { message: 'No shop found' });
            }
            // indexOf returns -1 if the key is not found, but -1 is truthy so we have check
            // for not equality with -1; which is what we do in the next if
            if (shop.invitations.indexOf(invitationResponse.body.invitationId)) {
              shop.invitations.push(invitationResponse.body.invitationId);
            }
            // I am not sure I understand this bit
            // it looks to me that `shop.users` has to be like [id1, id2, id3, ...]
            // otherwise a lookup with indexOf could not be possible, but then
            // if the if evaluates to true we push and object, and not an id, to the
            // `shop.users` array
            if (shop.users.indexOf(createdUser._id) === -1) {
              shop.users.push(createdUser);
            }
            shop.save();
          });
        });
      } else if (invitationResponse.status === 200) {
        // 200 as a status code from `invitationResponse` here is misleading, probably 412 precondition failed or 409 conflict
        // might be better here
        // 400 in the response status is okay, a bit too generic possibly, but still acceptable IMHO
        res.status(400).json({
          // there is an inconsistency here, we specify a `error: true` attribute, but we didn't do that
          // for the other errors, I think it could be a good idea to relief the frontend from the burden
          // of knowing which status codes represent an error, but we have to be consistent through our
          // responses
          error: true,
          message: 'User already invited to this shop'
        });
        return;
      }
      // this gets executed if `invitationResponse.status === 201` evaluates to true, I think
      // it would be better to have it after `shop.save()`
      res.json(invitationResponse);
    });
};
