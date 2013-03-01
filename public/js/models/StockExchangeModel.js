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

  var $G = $.Goxnode();

  return Backbone.Model.extend({

    getCurrencyPair: function() {
      return {
        base: this.get('base'),
        cur: this.get('cur')
      }
    },


    getBaseCurrency: function() {
      return this.get('base');
    },

    getCurrencyPart: function(currency) {
      if (currency === this.get('base')) {
        return 'base';
      } else {
        return 'cur';
      }
    },


    getOppositePart: function(part) {
      if (part !== 'base') {
        return 'base';
      } else {
        return 'cur';
      }
    },


    getStockParams: function() {
      return {
        base: this.get('base'),
        cur: this.get('cur'),
        stockFee: this.get('stockFee'),
        baseQuant: this.get('baseQuant')
      }
    },


    getTradeFonds: function(freeFonds, currencyPart) {
      var me = this,
        stockFee = this.get('stockFee');

      var parts = [],
        ret = {};

      var partial = currencyPart !== undefined;
      if (partial) {
        var oppositePart = me.getOppositePart(currencyPart);

        parts.push(oppositePart);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        var fond = (partial ? freeFonds : freeFonds[part]) * stockFee;

        if (!partial) {
          ret[part] = fond;
        } else {
          ret = fond;
        }
      });

      return ret;
    },


    getStrategyFonds: function(fonds, percent, currencyPart) {
      var me = this,
        parts = [],
        ret = {};

      var partial = currencyPart !== undefined;
      if (partial) {
        parts.push(currencyPart);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        var oppositePart = me.getOppositePart(part),
          oppositeFond = (partial ? fonds : fonds[oppositePart])  * percent;

        if (!partial) {
          ret[part] = oppositeFond;
        } else {
          ret = oppositeFond;
        }
      });

      return ret;

    },


    getOrderFonds: function(fonds, ticker, currencyPart) {
      var me = this,
        ask = ticker.ask,
        bid = ticker.bid;

      var baseQuant = this.get('baseQuant'),
        parts = [],
        ret = {};


      var partial = currencyPart !== undefined;
      if (partial) {
        parts.push(currencyPart);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        var oppositePart = part,
          oppositeFond = partial ? fonds : fonds[oppositePart];

        switch(part) {
          case 'base':
            ret[part] = oppositeFond / (bid + baseQuant);
            break;
          case 'cur':
            ret[part] = oppositeFond * (ask - baseQuant);
            break;
        }
      });

      if (partial) {
        ret = ret[currencyPart];
      }
      return ret;

    },


    getInstantFonds: function(fonds, ticker, slips, currencyPart) {
      var me = this,
        ask = ticker.ask,
        bid = ticker.bid;

      var parts = [],
        ret = {};


      var partial = currencyPart !== undefined;
      if (partial) {
        parts.push(currencyPart);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        var oppositePart = part,
          oppositeFond = partial ? fonds : fonds[oppositePart];

        switch(part) {
          case 'base':
            ret[part] = oppositeFond * slips.base / ask;
            break;
          case 'cur':
            ret[part] = oppositeFond * slips.cur * bid;
            break;
        }
      });

      if (partial) {
        ret = ret[currencyPart];
      }
      return ret;
    },


    getNatureBaseSize: function(tradeAccount, stockTicker, nature, strategy, currency) {
      var part = this.getCurrencyPart(currency),
        oppositePart = this.getOppositePart(part),
        oppositeCurrency = this.get(oppositePart);

      var freeFonds = tradeAccount.getFreeFonds(oppositeCurrency);
      var tradeFonds = this.getTradeFonds(freeFonds, part);
      var percent = parseInt(strategy) / 100;
      var strategyFonds = this.getStrategyFonds(tradeFonds, percent, part);
      var ticker = stockTicker.getTicker();

      var retFond;
      if (nature.toUpperCase() == 'INSTANT') {
        var slips = stockTicker.getStrategySlips(strategy);
        retFond = this.getInstantFonds(strategyFonds, ticker, slips, part);
      } else if (nature.toUpperCase() == 'ORDER') {
        retFond = this.getOrderFonds(strategyFonds, ticker, part);
      }
      return retFond;
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
