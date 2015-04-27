'use strict';

module.exports = {
  /**
   * Curries router_impl with pr as the first parameter to it.  Returns a function with the right signature for an
   * Express router from a router implementation function that expects to be curried. Behaviour undefined for other
   * `router_impl` function signatures.
   *
   * @param  {Function} router_impl A router implementation function, taking pr, req, res, next
   * @param  {Object}   pr          The PR module (to be injected)
   * @return {Function}             A router function which takes res, res and next and calls the impl param func
   */
  inject_pr_into_router_impl: function (router_impl, pr) {
    return function(req, res, next) {
      return router_impl(pr, req, res, next);
    };
  }
};
