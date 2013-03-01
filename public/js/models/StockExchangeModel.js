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

  var $G = $.Goxnode(),
    $m = $G.multipliers,
    $d = $G.digits;

  return Backbone.Model.extend({

    round: function(fond, currency) {
      digits = $d[currency] || 100;
      return Math.round(fond * digits) / digits;
    },

    getStockParams: function() {
      return {
        base: this.get('base'),
        cur: this.get('cur'),
        stockFee: this.get('stockFee'),
        baseQuant: this.get('baseQuant')
      }
    },

    getStrategyFonds: function(percent, fonds, currency) {
      var stockFee = this.get('stockFee'),
        parts = [],
        ret = {};

      if (currency !== undefined) {
        parts.push(currency);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        ret[part] = fonds[part] * percent * stockFee;
      });

      if (parts.length == 1) {
        ret = ret[0];
      }
      return ret;

    },


    getOrderFonds: function(fonds, ticker, currency) {
      var ask = ticker.ask,
        bid = ticker.bid;

      var baseQuant = this.get('baseQuant'),
        parts = [],
        ret = {};


      if (currency !== undefined) {
        parts.push(currency);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        switch(part) {
          case 'base':
            ret[part] = fonds.cur / (bid + baseQuant);
            break;
          case 'cur':
            ret[part] = fonds.base * (ask - baseQuant);
            break;
        }
      });

      if (parts.length == 1) {
        ret = ret[0];
      }
      return ret;

    },


    getInstantFonds: function(fonds, ticker, slips, currency) {
      var ask = ticker.ask,
        bid = ticker.bid;

      var parts = [],
        ret = {};


      if (currency !== undefined) {
        parts.push(currency);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        switch(part) {
          case 'base':
            ret[part] = fonds.cur * slips.base / ask;
            break;
          case 'cur':
            ret[part] = fonds.base * slips.cur * bid;
            break;
        }
      });

      if (parts.length == 1) {
        ret = ret[0];
      }
      return ret;



    },

    calculateFonds: function(tradeAccount, currency) {
      var stockFee = this.get('stockFee'),
        baseQuant = this.get('baseQuant'),
        baseMinTrade = this.get('baseMinTrade'),
        base = this.get('base'),
        cur = this.get('cur'),

        baseMult = $m[base],
        curMult = $m[cur],
        fondBase = tradeAccount.get(base) / baseMult,
        fondCur = tradeAccount.get(cur) / curMult;

      return {
        base: fondBase,
        cur: fondCur
      }
    },

    defaults: {
      base: 'BTC',
      cur: 'USD',
      stockFee: 0.994,
      baseQuant: 0.00001,
      baseMinTrade: 0.01
    },

    initialize: function() {

    }
  })
});
