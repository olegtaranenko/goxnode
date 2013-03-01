/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 27.02.13 16:34
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    evaluateValues: function () {

    },

    defaults: {
      bid: 29.1234,
      ask: 29.8721,
      slips: {
        "100": {
          base: 0.95,
          cur:  0.98
        },
        "50": {
          base: 0.97,
          cur:  0.99
        },
        "30": {
          base: 0.98,
          cur:  1
        }
      }
    },

    initialize: function() {

    }
  })
});
