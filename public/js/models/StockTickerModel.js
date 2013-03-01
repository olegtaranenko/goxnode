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
    getStrategySlips: function(strategy, currency) {

      var slips = this.get('slips'),
        strategySlip = slips[strategy],
        parts = [],
        ret = {};

      if (currency !== undefined) {
        parts.push(currency);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        ret[part] = strategySlip[part];
      });

      if (parts.length == 1) {
        ret = ret[0];
      }
      return ret;
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
