// NO LOGGING IN THIS FILE

'use strict';

/**
 * Escapes a string for use in a regular expression
 * @param  {String} s The string to be escaped
 * @return {String}   A string which can be used in a JS regex, it will match occurrences of `s`
 */
RegExp.escape_text= function escape_text(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
