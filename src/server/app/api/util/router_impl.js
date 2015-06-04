'use strict';

module.exports = {
  /**
   * Used for signalling success to the client - server actions can redirect to this API endpoint
   */
  success: function success(req, res, next) {
    var result = {
      status: 'success',
      message: req.flash('message')[0]
    };
    res.status(200).send(result);
  },

  /**
   * Used for signalling failure to the client - server actions can redirect to this API endpoint
   */
  failure: function failure(req, res, next) {
    var result = {
      status: 'failure',
      message: req.flash('message')[0]
    };
    res.status(200).send(result);
  }
};
