/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 10:55
 */
define([
  'jquery', 'underscore', 'backbone',
  'text!/templates/startup.html', 'text!/templates/actionui.html', 'text!/templates/orderui.html',
  'StartupModel', 'TradeAction', 'CurrencyValueModel'
],

function($, _, Backbone,
          tpl, actionUI, orderUI,
          StartupModel, TradeAction, CurrencyValueModel
) {

  return Backbone.View.extend({
    template: _.template(tpl),
    actionTemplate: _.template(actionUI),
    orderTemplate: _.template(orderUI),

    /**
     *
     * @param config
     */
    initialize: function (config) {
      var Goxnode = $.Goxnode(),
        eventsProto = {
          "#nav a.add": 'addThread',
          "#nav a.menu": 'showNew',
          ".attempt > span": 'tradeAction'
        };

      this.events = Goxnode.generateTapEvents(eventsProto);
      this.model = config.model;
    },

    /**
     *
     * @param e
     */
    tradeAction: function(e) {

      var target = e.target,
        targetsClasses = target.className,
        classes = targetsClasses.split(' '),
        parent = target.parentNode,
        parentClasses = parent.className,
        re = /p(\d+)/,
        matched = parentClasses.match(re),
        strategy = false,
        strategyPercent = false;

      if (matched) {
        strategy = matched[1];
        strategyPercent = parseInt(strategy);
      }

      var actionNature = null; //(tradeUrgent ? 'instant' : 'order');
      var currency = null,
        side;
      _.each(classes, function(cls) {
        switch (cls) {
          case 'bid':
          case 'ask':
            side = cls;
            break;
          case 'order':
          case 'instant':
            actionNature = cls.toUpperCase();
            break;
        }
      });

      console.log('Init Trade Action ->', currency + ': ' + strategyPercent + '%, ', actionNature);

      var model = this.model,
        tradeAccount = model.get('tradeAccount'),
        stockExchange = model.get('stockExchange'),
        stockTicker = model.get('stockTicker');


      currency = side == 'bid' ? 'USD' : 'BTC';
      var params = stockExchange.getNatureBaseSize(tradeAccount, stockTicker, actionNature, strategy, currency);

      var tradeAction = new TradeAction({
        timestamp: $.now(),
        nature: actionNature,
        currency: currency,
        price: params.tradePrice,
        size: params.baseFond,
        brutto: params.baseBrutto,
        curSize: params.currencyFond,
        curBrutto: params.currencyBrutto,
        strategy: strategyPercent
      });

      var tradeActionEl = this.createTradeAction(tradeAction, stockExchange, stockTicker, {
        ui: true
      });
    },

    /**
     *
     * Cancel Trade Action on user tapping at 'Cancel' button
     *
     * @param e {Event} jQuery event, this => button
     */
    cancelTradeAction: function(e) {
      var me = e.data.me,
        model = me.model,
        tradeAccount = model.get('tradeAccount'),
        actionsEl = tradeAccount.getContentEl(),
        tradeActions = model.get('activeTradeActions'),
        target = e.target;

      do {
        var targetId = target.id,
          done = target.tagName == 'A';

        target = target.parentElement;
        if (!done) {
          done = !target;
        }
      } while (!done);

      if (targetId) {
        var tradeAction = tradeActions.get(targetId),
          actionEl = tradeAction.get('el');

        actionsEl.removeChild(actionEl);
        tradeActions.remove(tradeAction);
      }
    },


    /**
     * Using template actionui.html constructs the markup for new Trade Action and append it to #gox form.
     * Reference to created DOM element is stored to TradeAction model
     *
     * @param tradeAction {TradeAction} model
     * @param stockTicker
     * @param stockExchange
     */
    createTradeAction: function(tradeAction, stockExchange, stockTicker) {
      var $G = $.Goxnode();
      var model = this.model, //StartupModel
        tradeAccount = model.get('tradeAccount'),
        tradeActions = model.get('activeTradeActions');

      tradeActions.add(tradeAction);

      var actionsEl = tradeAccount.getContentEl(),
        actionUI = this.actionTemplate({
          tradeAction: tradeAction,
          stockExchange: stockExchange,
          stockTicker: stockTicker
        });


      // jqm enhancement
      $(actionsEl).append(actionUI).trigger('create');

      // trick to get new created DOM element
      var actionEl = actionsEl.lastElementChild;

      // let save it to model
      tradeAction.set({
        el: actionEl
      });

      var cancelEl = $('a', actionEl);
      var tapEvent = $G.tapEvent;
      $(cancelEl).on(tapEvent, {me: this}, this.cancelTradeAction);

      return actionEl;
    },


    findOrderId: function (e) {
      var target = e.target,
        targetId;

      do {
        var done = $(target).hasClass('trade-order');

        targetId = target.id;

        target = target.parentElement;
        if (!done) {
          done = !target;
        }
      } while (!done);

      return targetId;
    },


    cancelOrder: function(e) {
      var me = e.data.me,
        orderId = me.findOrderId(e),
        startupModel = me.model,
        orders = startupModel.get('orders'),
        order = orders.get(orderId),
        status = order.get('status'),
        editing = status == 'editing';


      if (!editing) {
        if (orderId) {
          var $G = $.Goxnode(),
            socket = $G.socket;

          socket.emit('cancelOrder', orderId);
        }
      } else {
        // revert changes to before edit
        order.set('status', 'revert');

      }
    },


    confirmOrder: function(e) {
      var me = e.data.me,
        startupModel = me.model,
        orders = startupModel.get('orders'),
        ticker = startupModel.get('stockTicker'),
        bid = ticker.get('bid'),
        ask = ticker.get('ask'),
        targetId = me.findOrderId(e),
        orderModel = orders.get(targetId),
        orderType = orderModel.get('type'),
        orderPrice = orderModel.get('price').get('value'),
        isBid = orderType == 'bid',
        absoluteEdge = !isBid ? 0 : Number.MAX_VALUE,
        warningEdge = isBid ? ask : bid;

      orders.each(function(order) {
        var type = order.get('type');

        if (type != orderType) {
          var price = order.get('price').get('value_int');

          if ((isBid && price < absoluteEdge) || (!isBid && price > absoluteEdge)) {
            absoluteEdge = price;
          }
        }
      });

      var warning, noGo = false,
        warningType, warningSeverity = 0;

      if ((isBid && warningEdge > absoluteEdge) || (!isBid && warningEdge < absoluteEdge)) {
        warningSeverity = 3;
      } else if ((isBid && orderPrice > absoluteEdge) || (!isBid && orderPrice < absoluteEdge)) {
        warning = 'First remove Orders';
        warningSeverity = 2;
      } else if ((isBid && orderPrice > warningEdge) || (!isBid && orderPrice < warningEdge)) {
        warning = (isBid ? 'BUY' : 'SELL') + ' RIGHT NOW?';
        warningSeverity = 1;
      }

      if (warningSeverity) {
        var dialog = $('#dialogPage');
        $.mobile.changePage( "#dialogPage", { role: "dialog" } );
      }

      if (targetId) {
        var $G = $.Goxnode(),
          socket = $G.socket;
      }
    },


    createOrder: function(model, insertedEl) {
      var $G = $.Goxnode();
      var startupModel = this.model,
        tradeAccount = startupModel.get('tradeAccount'),
        stockExchange = startupModel.get('stockExchange'),
        stockTicker = startupModel.get('stockTicker'),
        orderBase = model.get('item'),
        orderCur = model.get('currency'),
        base = stockExchange.getBaseCurrency(),
        cur = stockExchange.getCurCurrency(),
        orders = startupModel.get('orders'),
        el = orders.getContentEl();

      if (!el || !(orderBase == base && orderCur == cur)) {
        return;
      }

      orderUI = this.orderTemplate({
        model: model,
        stockTicker: stockTicker,
        stockExchange: stockExchange,
        tradeAccount: tradeAccount
      });

      var ct = $(el).append(orderUI).trigger('create');

      // trick to get new created DOM element
      // let save it to model
      var orderEl = model.el = el.lastElementChild,
        $order = $(orderEl);

      if (insertedEl != null) {
        $(insertedEl).before($order);
      }


      var tapEvent = $G.tapEvent;

      var cancelEl = model.cancelButtonEl();
      $(cancelEl).on(tapEvent, {me: this}, this.cancelOrder);

      var confirmEl = model.confirmButtonEl();
      $(confirmEl).on(tapEvent, {me: this}, this.confirmOrder);

      function calculateChangeOptions($slider, sliderRoot) {
        var valueModel, currency,
          changeProperty, value,
          changeOptions = {};

        var sliderValue = $slider.val(),
          sliderValueNumber = parseFloat(sliderValue),
          valueOptions = {
            ui: true
          };


        if (sliderRoot == 'amount') {
          currency = stockExchange.getBaseCurrency();
          value = sliderValue;
          changeProperty = 'amount';
        } else {
          var orderPriceNum = parseFloat(model.get('price').get('value')),
            digitsValue = Math.ceil(orderPriceNum);

          changeProperty = 'price';
          currency = stockExchange.getCurCurrency();

          if (sliderRoot == 'cents') {
            value = digitsValue + sliderValueNumber;
          } else {
            var centsValue = orderPriceNum - digitsValue;
            value = sliderValueNumber + centsValue;
          }
        }

        var valueAttributes = {
          value: value,
          currency: currency
        };

        valueModel = new CurrencyValueModel(valueAttributes,valueOptions);
        changeOptions[changeProperty] = valueModel;

        return changeOptions;
      }

      var allSliders = {};
      _.each(['digits', 'cents', 'amount'], function(sliderRoot) {

        var sliderEl = $order.find('input.' + sliderRoot),
          $slider = $(sliderEl),
          initialValue = $slider.val();

        allSliders[sliderRoot] = {
          el: sliderEl,
          value: initialValue
        };

        $slider.slider({
          stop: function(jqEvent) {
//          console.log('slider stop event', jqEvent);
            var changeOptions = calculateChangeOptions($slider, sliderRoot);

            // should call separate, otherwise wrong original values
            model.set('status', 'editing');
            model.set(changeOptions);
          }
        })
      });

      model.allSliders = allSliders;

    },


    /**
     * tb removed?
     */
    addThread: function() {
      console.log('new thread about to add...');
      alert('addThread');
    },


    /**
     * tb removed?
     */
    showNew: function() {
      console.log('show new threads...');
    },

    /**
     * Main page rendering. Use predefined template 'startup.html'
     *
     * @returns {*}
     */
    render: function() {
      var me = this,
        $el = me.$el,
        model = me.model;

      var tradeAccount = model.get('tradeAccount'),
        strategies = tradeAccount.get('strategies'),
        stockExchange = model.get('stockExchange'),
        stockTicker = model.get('stockTicker'),
        orders = model.get('orders');


      $el.html(this.template({
        strategies: strategies,
        tradeAccount: tradeAccount,
        stockExchange: stockExchange,
        stockTicker: stockTicker
      }));

      var goxnode = this.el.lastElementChild;

      model.set({
        el: goxnode
      });

      $el.on('pageinit', function() {
        var collapsibleEl = $(goxnode).find('[data-role=collapsible-set]'),
//          collapsibleList = collapsibleEl.children(),
          strategiesEl = $(collapsibleEl).find('.strategies'),
          ordersEl = $(collapsibleEl).find('.orders');

        tradeAccount.set({el: strategiesEl});
        orders.el = ordersEl;
        orders.owner = me;
      });

      return this;
    }
  });

});
