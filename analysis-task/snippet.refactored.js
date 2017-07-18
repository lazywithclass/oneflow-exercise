// these two following functions go into a library of their own, where we know how to deal
// with errors and where we expose a common interface to the user of our service when
// an error occurs; it might be a good idea to search for a module that abstract away
// status code numbers with easy to remember names
function sendConflictError(res, message) {
  res.status(412).json({
    error: true,
    message: message
  });
}

function sendNotFoundError(res, message) {
  res.status(404).json({
    error: true,
    message: message
  });
}

// these two following functions could arguably go into the same module as the
// two functions above
function handleHttpError(funx) {
  return function(err, res) {
    if (err) {
      // log the error to whatever service the team decides
      // has to be used to collect errors,
      // AWS CloudWatch, Loggly, Papertrail, etc

      // based on the error nature we could establish a status code
      var status = '?';
      res.status(status).send({ error: true, message: err.message });
    } else {
      funx(res);
    }
  };
}

function handleError(nokCallback, okCallback) {
  return function(err, data) {
    if (err) {
      // log the error to whatever service the team decides
      // has to be used to collect errors,
      // AWS CloudWatch, Loggly, Papertrail, etc

      // based on the error nature we could establish a status code
      var status = '?';
      nokCallback(err)
    } else {
      okCallback(data);
    }
  };
}

// it could be a good idea to upgrade our node environment, besides let const and
// nicer function declaration we also get `Array.prototype.includes`
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
function contains(arr, key) {
  return arr.indexOf(key) > -1;
}

// this should go into a library of functions, depending on
// the project structure it could be either the user module
// or the shop one
function addUserToShop(invitation, shopId, done) {
  User.findOneAndUpdate(
    { authId: invitation.authId },
    { email: invitation.email },
    { upsert: true, new: true },
    function(err, createdUser) {
      Shop.findById(shopId).exec(handleError(done, function(shop) {
        if (!shop) {
          return sendNotFoundError(res, 'No shop found')
        }

        if (!contains(shop.invitations, invitation.id)) {
          shop.invitations.push(invitation.id);
        }
        if (!contains(shop.users, createdUser._id)) {
          shop.users.push(createdUser);
        }
        shop.save(handleError(done));
      }));
    });
}

// I didn't introduce promises just because I already felt uncomfortable
// refactoring without tests, and didn't want to do any silly mistake, but with
// the help of tests that's where I would go, also, if we were into it, we could
// spike `async` `await`
exports.inviteUser = function(req, res) {

  var invitationBody = req.body;
  var authUrl = "https://url.to.auth.system.com/invitation";

  superagent
    .post(authUrl)
    .send(invitationBody)
    .end(handleHttpError(function(invitationResponse) {
      if (invitationResponse.status === 412) {
        return sendConflictError(res, 'User already invited to this shop')
      }

      if (invitationResponse.status === 201) {
        var invitation = {
          email: invitationBody.email,
          authId: invitationResponse.body.authId,
          id: invitationResponse.body.invitationId
        }
        addUserToShop(invitation, req.params.shopId, function() {
          res.json(invitationResponse);
        })
      }
    }));
};
