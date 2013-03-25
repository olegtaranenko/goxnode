/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 26.02.13 16:41
 */
define([
  'backbone'
], function(Backbone) {

  var $G = $.Goxnode(),
    $m = $G.multipliers;

  return Backbone.Model.extend({

    getFreeFonds: function(pair) {
      var me = this,
        ret = {},
        partial = false;

      if (_.isString(pair)) {
        pair = [pair];
        partial = true;
      }

      _.each(pair, function(currency, part) {
        var multiplier = $m[currency],
          fond = me.get(currency) / multiplier;

        if (!partial) {
          ret[part] = fond;
        } else {
          ret = fond;
        }
      });

      return ret;
    },


    defaults: {
      strategies: $G.config.strategies,
      owner: null // reference to startupModel
    },

    evaluateStrategies: function (owner, currency, side) {
      
      var tradeAccount = owner.get('tradeAccount');
      var goxEl = owner.get('el');
      var selector = '.currency-state .' + currency.toLowerCase();
      var div = $(selector, goxEl),
        fond = tradeAccount.getFreeFonds(currency),
        fondRounded = $G.roundFond(fond, currency);

      div.text(fondRounded);

      var strategies = tradeAccount.get('strategies'),
        stockExchange = owner.get('stockExchange'),
        stockTicker = owner.get('stockTicker'),
        ticker = stockTicker.getTicker();

      if (stockExchange == null) {
        // skip triggering on init phase
            return;
      }

      _.each(strategies, function (strategy) {

        var rowSelector = '.attempt.p' + strategy,
          rowDiv = $(rowSelector, goxEl);

//            debugger;
        var percentFloat = parseInt(strategy) / 100;
        var pair = stockExchange.getCurrencyPair();
        var freeFonds = tradeAccount.getFreeFonds(pair);
        var fonds = stockExchange.getTradeFonds(freeFonds);

        fonds.strategy = stockExchange.getStrategyFonds(fonds, percentFloat);

        fonds.order = stockExchange.getOrderFonds(fonds.strategy, ticker);

        fonds.slips = stockTicker.getStrategySlips(strategy);

        fonds.instant = stockExchange.getInstantFonds(fonds.strategy, ticker, fonds.slips);

        var tradeType = side == 'bid' ? 'cur' : 'base';
        var tradeCurrency = side == 'bid' ? 'USD' : 'BTC';

        _.each(['instant', 'order'], function (instant) {
          var columnSelector = '.' + side + '.' + instant,
            cellSpan = $(columnSelector, rowDiv),
            curValue = fonds[instant][tradeType],
            rounded = $G.roundFond(curValue, tradeCurrency);

          cellSpan.text(rounded);
        });
      });

    },


    initialize: function(attributes, options) {
      var me = this,
        owner = me.get('owner'),
        cur = options.cur,
        base = options.base,
        modelOptions = {};


      modelOptions[cur] = 0;
      modelOptions[base] = 0;
      _.extend(attributes, modelOptions);

      _.each([cur, base], function(currency) {
        var changeEvent = 'change:' + currency;

        me.on(changeEvent, function(model) {
          _.each(['bid', 'ask'], function (tradeSide) {
            me.evaluateStrategies(owner, currency, tradeSide);
          });
        });

      });
    }
  })
});
