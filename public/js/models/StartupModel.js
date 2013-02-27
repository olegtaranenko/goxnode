/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 11:22
 */
define([
  'backbone', 'TradeActions', 'TradeAccountModel', 'StockTickerModel', 'StockExchangeModel'
], function(Backbone, TradeActions, TradeAccountModel, StockTickerModel, StockExchangeModel) {

  return Backbone.Model.extend({
    defaults: {
      id: 0,
      login: '',
      status: 'inactive',
      strategies: {
        100: {
          slipBase: 0.95,
          slipCur:  0.98
        },
        50: {
          slipBase: 0.97,
          slipCur: 0.99
        },
        30: {
          slipBase: 0.98,
          slipCur: 1
        }
      },
      tradeAccount: new TradeAccountModel(),
      stockExchange: new StockExchangeModel(),
      stockTicker: new StockTickerModel(),
      activeTradeActions: new TradeActions(),  // active Trade Actions pool

      el: null,           // #gox
      now: 0              // time in millis
    },

    initialize: function() {

    }
  })
});
