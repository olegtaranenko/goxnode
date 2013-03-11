/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 11:22
 */
define([
  'backbone', 'TradeActions', 'TradeAccountModel', 'StockTickerModel', 'StockExchangeModel', 'PrivateInfoModel'
], function(Backbone, TradeActions, TradeAccountModel, StockTickerModel, StockExchangeModel, PrivateInfoModel) {

  return Backbone.Model.extend({
    defaults: {
      id: 0,
      login: '',
      status: 'inactive',
      privateInfo: new PrivateInfoModel({
        owner: this
      }),
      tradeAccount: null,
      stockExchange: null,
      stockTicker: new StockTickerModel(),
      activeTradeActions: new TradeActions(),  // active Trade Actions pool

      el: null,           // #gox
      now: 0              // time in millis
    },

    initialize: function(data, options) {
      var stock = options.stock,
        cur = options.cur,
        base = options.base,
        silent = {silent: true};

      var stockExchange = new StockExchangeModel({
            base: base,
            cur: cur
          },
          silent
        ),
        tradeAccountData = {},
        tradeAccountOptions = {
          silent: true,
          base: base,
          cur: cur
        };

      tradeAccountData[base] = 0;
      tradeAccountData[cur] = 0;
      tradeAccountData.owner = this;


      var tradeAccount = new TradeAccountModel(tradeAccountData, tradeAccountOptions);

      this.set({
          stockExchange: stockExchange,
          tradeAccount: tradeAccount
        },
        silent
      );

    }
  })
});
