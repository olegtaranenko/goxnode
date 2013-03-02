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
    $m = $G.multipliers;

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

    getCurCurrency: function() {
      return this.get('cur');
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
        parts = [],
        ret = {};

      var partial = currencyPart !== undefined;
      if (partial) {
        var oppositePart = me.getOppositePart(currencyPart);

        parts.push(oppositePart);
      } else {
        parts.push('base', 'cur');
      }

      _.each(parts, function(part) {
        var fond = (partial ? freeFonds : freeFonds[part]);

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
        stockFee = this.get('stockFee'),
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
        var fond = (partial ? fonds : fonds[part]) * stockFee;

        switch(part) {
          case 'base':
            ret[part] = fond / (bid + baseQuant);
            break;
          case 'cur':
            ret[part] = fond * (ask - baseQuant);
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
        stockFee = this.get('stockFee'),
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
        var fond = (partial ? fonds : fonds[part]) * stockFee;

        switch(part) {
          case 'base':
            ret[part] = fond * slips.base / ask;
            break;
          case 'cur':
            ret[part] = fond * slips.cur * bid;
            break;
        }
      });

      if (partial) {
        ret = ret[currencyPart];
      }
      return ret;
    },


    getNatureBaseSize: function(tradeAccount, stockTicker, nature, strategy, currency) {
      var baseQuant = this.get('baseQuant');

      var part = this.getCurrencyPart(currency),
        oppositePart = this.getOppositePart(part),
        oppositeCurrency = this.get(oppositePart);

      var freeFonds = tradeAccount.getFreeFonds(oppositeCurrency);
      var tradeFonds = this.getTradeFonds(freeFonds, part);
      var percent = parseInt(strategy) / 100;
      var strategyFonds = this.getStrategyFonds(tradeFonds, percent, part);
      var ticker = stockTicker.getTicker();
      var baseCurrency = this.getBaseCurrency();

      var ret = {}, baseFond, currencyFond, tradePrice;

      var fond;
      if (nature == 'INSTANT') {
        var slips = stockTicker.getStrategySlips(strategy);
        fond = this.getInstantFonds(strategyFonds, ticker, slips, part);
      } else if (nature == 'ORDER') {
        fond = this.getOrderFonds(strategyFonds, ticker, part);
      }

      tradePrice = stockTicker.getNatureTradePrice(nature, strategy, part, baseQuant);
      var baseBrutto;
      if (baseCurrency === currency) {
        currencyFond = strategyFonds;
        baseBrutto = currencyFond / tradePrice;
        baseFond = fond;
      } else {
        baseBrutto = strategyFonds;
        currencyFond = fond;
        baseFond = fond / tradePrice;
      }

      var currencyBrutto = baseBrutto * tradePrice;
      return {
        tradePrice: tradePrice,
        baseFond: baseFond,
        baseBrutto: baseBrutto,
        currencyFond: currencyFond,
        currencyBrutto: currencyBrutto
      };
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
