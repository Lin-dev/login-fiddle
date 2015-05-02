'use strict';

module.exports = {
  /**
   * Used for signalling success to the client - server actions can redirect to this API endpoint
   */
  success: function(req, res, next) {
    var result = {
      status: 'success'
    };
    res.status(200).send(result);
  },

  /**
   * Used for signalling failure to the client - server actions can redirect to this API endpoint
   */
  failure: function(req, res, next) {
    var result = {
      status: 'failure'
    };
    res.status(200).send(result);
  }
};
