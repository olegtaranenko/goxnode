/**
 * The file is a part of Goxnode project
 */
define([
  'backbone', 'jquery', 'underscore',
  'StartupPage', 'StartupModel',
  'OrderModel'
],
  function(Backbone, $, _,
           StartupPage, StartupModel,
           OrderModel
    ) {


    var $G = $.Goxnode();

    function socketConnect(url, page) {
      var startupModel = page.model;


      var socket = io.connect(url);

      function onConnect() {
        console.log('onConnect() ', arguments);
      }

      function onDisconnect() {
        console.log('onDisconnect() ', arguments);
      }

      function onError() {
        console.log('onError() ', arguments);
      }

      function onMessage() {

        console.log('onMessage() ', arguments);
      }

      function onConfig() {
        console.log('onConfig() ', arguments);
      }

      function onPrivateInfo(info) {
        console.log('onPrivateInfo() ', arguments);
        var tradeAccount = startupModel.get('tradeAccount'),
          stockExchange = startupModel.get('stockExchange'),
          base = stockExchange.get('base'),
          cur = stockExchange.get('cur'),
          wallets = info.Wallets,
          baseWallet = wallets[base],
          curWallet = wallets[cur],
          baseFond = baseWallet.Balance.value_int,
          curFond = curWallet.Balance.value_int;

        tradeAccount.set(base, baseFond);
        tradeAccount.set(cur, curFond);
      }

      function onOrdersInfo(info) {
        console.log('onOrdersInfo()', info);
        // create (or update) Model which contains PrivateInfo
        var ordersCollection = startupModel.get('orders'),
          models = [];

        _.each(info, function(orderInfo) {
          var order = new OrderModel(orderInfo);
          models.push(order);
        });
        ordersCollection.set(models, {silent: false});
      }

      function onTicker(ticker) {
        console.log('onTicker() ', arguments);
        // create (or update) Model which contains PrivateInfo
        var stockTicker = startupModel.get('stockTicker');

        stockTicker.set({
          ask: parseFloat(ticker.sell),
          bid: parseFloat(ticker.buy)
        })
      }

      function onOrdersCancelled(oid) {
        console.log('onOrdersCancelled() ', oid);
        var orders = startupModel.get('orders');

        orders.remove(oid);
      }

      function onUserOrder(oid) {
        console.log('onUserOrder() ', oid);
        var orders = startupModel.get('orders');

      }

      socket.on('connect',    onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('error',      onError);
      socket.on('message',    onMessage);
      socket.on('config',     onConfig);
      socket.on('privateinfo',onPrivateInfo);
      socket.on('ordersinfo', onOrdersInfo);
      socket.on('ticker',     onTicker);
      socket.on('order_cancel', onOrdersCancelled);
      socket.on('user_order',  onUserOrder);

      return socket;
    }

    return Backbone.Router.extend({

      routes: {
        "(:stock)(/:cur)(/:base)": 'startpage'
      },

      initialize: function () {
        this.firstPage = true;
      },


      startpage: function (stock, cur, base) {
        stock = stock || 'mtgox';
        cur = (cur || 'USD').toUpperCase();
        base = (base || 'BTC').toUpperCase();

        console.log('startpage...', stock, cur, base);
        $.mobile.showPageLoadingMsg();
        var webView = this;

        var model = new StartupModel({}, {
          stock: stock,
          cur: cur,
          base: base
        });

        var page = new StartupPage({
          model: model
        });

        var clientConfig = $G.config;

        webView.changePage(page);

        $G.socket = socketConnect(clientConfig.node.url, page);
        $.mobile.hidePageLoadingMsg();

      },

      /**
       * Process change page on the client (in browser) using jquery mobile facility
       *
       * @private
       * @param page {Backbone.View} Backbone View page
       * @param back {boolean} to manage slide direction
       */
      changePage: function (page, back) {
        var element = page.$el;

        element.attr('data-role', 'page');
        element.attr('data-theme', 'g');

        page.render();

        $('body').append(element);

        var transition = $.mobile.defaultPageTransition;

        // We don't want to fade the first page. Slide, and risk the annoying "jump to top".
        if (this.firstPage) {
          transition = "none";
          this.firstPage = false;
        }

        $.mobile.changePage(element, {
          changeHash:false,
          transition: transition,
          reverse: back
        });
      }
    });
  }
);
 