/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 27.02.13 16:34
 */
define([
  'backbone',
  'config'
], function(Backbone) {

  var $G = $.Goxnode();

  return Backbone.Model.extend({

    getTicker: function () {
      return {
        ask: this.get('ask'),
        bid: this.get('bid')
      }
    },

    getNatureTradePrice: function(nature, strategy, currencyPart, baseQuant) {
      var ret;

      switch (nature) {
        case 'INSTANT':
          var slips = this.get('slips'),
            strategySlip = slips[strategy];

          if (currencyPart == 'base') {
            ret = strategySlip.basePrice;
          } else {
            ret = strategySlip.curPrice;
          }
          break;

        case 'ORDER':
          if (currencyPart == 'base') {
            ret = this.get('bid') + baseQuant;
          } else {
            ret = this.get('ask') - baseQuant;
          }
          break;
      }
      return ret;
    },

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
      owner: null, // reference to startupModel
      bid: 29.1234,
      ask: 29.8721,
      slips: {
        "100": {
          base: 0.95,
          basePrice: 29.701,
          cur:  0.98,
          curPrice: 29.3213
        },
        "50": {
          base: 0.97,
          basePrice: 29.7513,
          cur:  0.99,
          curPrice: 29.2011
        },
        "30": {
          base: 0.98,
          basePrice: 29.8121,
          cur:  1,
          curPrice: 29.1234
        },
        "2": {
          base: 1,
          basePrice: 29.8721,
          cur:  1,
          curPrice: 29.1234
        }

      }
    },

    initialize: function() {
/*
      var changeEvent = 'change:' + currency,
        goxEl = owner.el,
        selector = '.currency-state .' + currency.toLowerCase();

      me.on(changeEvent, function(model) {

      });
*/
    }
  })
});
