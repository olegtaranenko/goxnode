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
      strategies: [ "100", "50", "30", "2"],
      owner: null // reference to startupModel
//      BTC: 5000230000,
//      USD: 100003240
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
        var changeEvent = 'change:' + currency,
          goxEl = owner.el,
          selector = '.currency-state .' + currency.toLowerCase();

        me.on(changeEvent, function(model) {
          var div = $(selector, goxEl),
            fond = me.getFreeFonds(currency);

          div.text(fond);

          var strategies = me.get('strategies'),
            stockExchange = owner.get('stockExchange'),
            stockTicker = owner.get('stockTicker'),
            ticker = stockTicker.getTicker();

          if (stockExchange == null) {
            // skip triggering on init phase
            return;
          }

          _.each(strategies, function (strategy) {

            var rowSelector = '.attempt.p' + strategy,
              goxEl = owner.el,
              rowDiv = $(rowSelector, goxEl);


//            debugger;
            var percentFloat = parseInt(strategy) / 100;


            var pair = stockExchange.getCurrencyPair();
            var freeFonds = me.getFreeFonds(pair);
            var fonds = stockExchange.getTradeFonds(freeFonds);

            fonds.strategy = stockExchange.getStrategyFonds(fonds, percentFloat);

            fonds.order = stockExchange.getOrderFonds(fonds.strategy, ticker);

            fonds.slips = stockTicker.getStrategySlips(strategy);

            fonds.instant = stockExchange.getInstantFonds(fonds.strategy, ticker, fonds.slips);

            _.each(['left', 'right'], function(side) {
              var currencySide = side == 'left' ? 'cur' : 'base';
              var currency = side == 'left' ? 'USD' : 'BTC';

              _.each(['instant', 'order'], function(instant) {
                var columnSelector = '.' + side + '.' + instant,
                  cellSpan = $(columnSelector, rowDiv),
                  curValue = fonds[instant][currencySide],
                  rounded = $G.roundFond(curValue, currency);

                cellSpan.text(rounded);
              });
            });

          });

          /*
           %>
           <div class="attempt p<%= strategy %> field4">
           <span class="left instant"><%= $G.roundFond(instantFonds.cur, cur) %></span>
           <span class="left order"><%= $G.roundFond(orderFonds.cur, cur) %></span>
           <span class="right order"><%= $G.roundFond(orderFonds.base, base) %></span>
           <span class="right instant"><%= $G.roundFond(instantFonds.base, base) %></span>
           </div>
           <%
           */

        });

      });




    }
  })
});
