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

    getTicker: function (side) {
      if (side === undefined) {
        return {
          ask: parseFloat(this.get('ask')),
          bid: parseFloat(this.get('bid'))
        }
      } else {
        return this.get(side);
      }
    },

    getNatureTradePrice: function(nature, strategy, currencyPart, baseQuant, ticker) {
      var ret;

      switch (nature) {
        case 'INSTANT':
          var slips = this.get('slips'),
            strategySlip = slips[strategy];

          if (currencyPart == 'base') {
            ret = ticker.bid;
          } else {
            ret = ticker.ask;
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

    isInited: function() {
      var bid = this.get('bid'),
        ask = this.get('ask');

      return !(bid == null || ask == null);

    },


    defaults: {
      bid: null,
      ask: null,
      slips: {
        "100": {
          base: 1,
//          basePrice: 29.701,
          cur:  1,
//          curPrice: 29.3213
        },
        "50": {
          base: 1,
//          basePrice: 29.7513,
          cur:  1,
//          curPrice: 29.2011
        },
        "30": {
          base: 1,
//          basePrice: 29.8121,
          cur:  1,
//          curPrice: 29.1234
        },
        "2": {
          base: 1,
//          basePrice: 29.8721,
          cur:  1,
//          curPrice: 29.1234
        }

      }
    },

    initialize: function(attributes, options) {
      var me = this,
        cur = options.cur,
        base = options.base;

      _.each(['bid', 'ask'], function (tradeSide) {
        var changeEvent = 'change:' + tradeSide;
        me.on(changeEvent, function(model) {
          _.each([cur, base], function(currency) {
            var owner = me.owner;

            if (owner) {
              $G.evaluateStrategies(owner, currency, tradeSide);
            }
          });
        });

      });
    }
  })
});
