// Use Goxnode namespace as a jQuery plugin to get access from anywhere
define(['socket.io', 'jquery', "settings"],
  function(io, $, clientConfig) {

/*
    $.ajax('/client.json')
      .done(function(data){
        try {
          var clientConfig = eval('statics.config = ' + data);
          console.log('Client configuration loaded successful => ', clientConfig);
        } catch (e) {
          console.error('Failure parsing client.json', e);
        }
      })
      .fail(function() {
        console.error('Error reading client configuration', arguments);
//      })
//      .always(function(data, result, response){
      });
*/

    var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase())),
      tapEvent = mobile ? 'touchstart' : 'vclick';

    var statics = {

      config: clientConfig,
      mobile   : mobile,

      tapEvent : tapEvent,

      actionDateFormat: '%H:%M:%S.%i',
      orderDateFormat: '%d.%m.%Y %X',

      multipliers: {
        BTC: 100000000,
        USD: 100000
      },

      digits: {
        BTC: 100000,
        USD: 100
      },

      persistOrder: function(model, options) {
        console.log('persistOrder', model, options);
        var json = model.dehydrate(options);
      },

      evaluateStrategies: function (owner, currency, side) {
        var $G = this;
        var tradeAccount = owner.get('tradeAccount'),
          stockTicker = owner.get('stockTicker'),
          stockExchange = owner.get('stockExchange');

        if (stockExchange == null) {
          // skip triggering on init phase
          return;
        }

        var goxEl = owner.get('el');
        var fondSelector = '.currency-state .' + currency.toLowerCase();
        var fondDiv = $(fondSelector, goxEl),
          fond = tradeAccount.getFreeFonds(currency),
          fondRounded = $G.roundFond(fond, currency);

        fondDiv.text(fondRounded);

        if (!stockTicker.isInited()) {
          return;
        }

        var ticker = stockTicker.getTicker();
        var tickerSelector = '.currency-state .ticker.' + side.toLowerCase();
        var tickerDiv = $(tickerSelector, goxEl);

        tickerDiv.text('@' + ticker[side]);

        var strategies = tradeAccount.get('strategies');
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


      convertToIntValue: function(value, currency) {
        var multiplier = this.multipliers[currency];

        return Math.round(value * multiplier);
      },

      /**
       *
       * @param fond
       * @param [currency]
       * @returns {number}
       */
      roundFond: function(fond, currency) {
        var digits = this.digits[currency] || 100;
        return Math.round(fond * digits) / digits;
      },


      generateTapEvents: function(events, originalEvents) {
        var ret = originalEvents || {} ;
        $.each(events, function(key, value) {
//          console.log(arguments);
          var eventKey = tapEvent + ' ' + key;
          ret[eventKey] = value;
        });
        return ret;
      }
    };


    $.extend($, {
      Goxnode: function(options) {
        return $.extend(statics, options);
      }
    });

    $.extend($.fn, {
      Goxnode: function (options) {
        return this.each(function () {
          $.Goxnode(options);
        });
      }
    });

    $(document).bind("mobileinit", function () {
      $.mobile.ajaxEnabled = false;
      $.mobile.linkBindingEnabled = false;
      $.mobile.hashListeningEnabled = false;
      $.mobile.pushStateEnabled = false;
      $.mobile.defaultPageTransition = "slide";
      $.mobile.loader.prototype.options.theme = "b";


      // Remove page from DOM when it's being replaced.
      $(document).on("pagehide", "div[data-role='page']", function (event, ui) {
        $(event.currentTarget).remove();
      });
    });
  }
);

