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

    pureFonds: function(fonds, percent, currency) {
      var base, cur, ret;

      if (currency !== undefined) {
        switch (currency) {
          case 'base':
          case 'cur':
            ret = fonds[currency];
        }
      } else {

        ret = {
          base: base,
          cur: cur
        }
      }
      return ret;
    },

    calculateFonds: function(tradeAccount) {
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
