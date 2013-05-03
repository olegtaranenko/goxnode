/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 11:22
 */
define([
  'backbone', 'TradeActions', 'TradeAccountModel', 'StockTickerModel', 'StockExchangeModel', 'PrivateInfoModel',
  'Orders'
], function(Backbone, TradeActions, TradeAccountModel, StockTickerModel, StockExchangeModel, PrivateInfoModel,
            Orders
  ) {

  var _super = Backbone.Model.prototype;

  return Backbone.Model.extend({

    defaults: {
      id: 0,
      login: '',
      status: 'inactive',
      privateInfo: null, //new PrivateInfoModel({owner: this}),
      tradeAccount: null,
      stockExchange: null,
      stockTicker: null,
      activeTradeActions: new TradeActions(),  // active Trade Actions pool
      orders: new Orders(), // currently open orders. First loaded from mtgox by startup via OrdersInfo event

      el: null,           // #gox
      now: 0              // time in millis
    },

    constructor: function(attributes, options) {
      var me = this;

      var stock = options.stock,
        cur = options.cur,
        base = options.base,
        silent = {silent: true};


      console.log('StartupModel constructor', attributes, options);
      var stockExchange = new StockExchangeModel({
            name: stock,
            base: base,
            cur: cur
          }
        ),
        tradeAccountData = {
          pair: {
            base: base,
            cur: cur
          }
        },
        initOptions = {
          silent: true,
          base: base,
          cur: cur
        };

      tradeAccountData[base] = 0;
      tradeAccountData[cur] = 0;
//      tradeAccountData.owner = this;

      var tradeAccount = new TradeAccountModel(tradeAccountData, initOptions);

      var stockTicker = new StockTickerModel({
          ask: null,
          bid: null
        },
        initOptions
      );

      _.extend(attributes, {
          stockExchange: stockExchange,
          tradeAccount: tradeAccount,
          stockTicker: stockTicker
        }
      );

      _super.constructor.apply(me, arguments);
    },

    initialize: function(data, options) {
      var tradeAccount = this.get('tradeAccount'),
        stockTicker = this.get('stockTicker');

      tradeAccount.owner = this;
      stockTicker.owner = this;

    }
  })
});
