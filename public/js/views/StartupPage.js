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
  'StartupModel', 'TradeAction'
],

function($, _, Backbone,
          tpl, actionUI, orderUI,
          StartupModel, TradeAction
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
        var done = target.tagName == 'FIELDSET';

        target = target.parentElement;
        if (!done) {
          done = !target;
        } else {
          targetId = target.id; // parent of FIELDSET
        }
      } while (!done);

      return targetId;
    },


    cancelOrder: function(e) {
      var me = e.data.me,
        targetId = me.findOrderId(e);


      if (targetId) {
        var $G = $.Goxnode(),
          socket = $G.socket;

        socket.emit('cancelOrder', targetId);
      }
    },


    confirmOrder: function(e) {
      var me = e.data.me,
        model = me.model,
        orders = model.get('orders');

      var targetId = me.findOrderId(e);
      if (targetId) {
        var $G = $.Goxnode(),
          socket = $G.socket;
      }
    },


    createOrder: function(model, el) {
      var $G = $.Goxnode();
      var startupModel = this.model,
        tradeAccount = startupModel.get('tradeAccount'),
        stockExchange = startupModel.get('stockExchange'),
        stockTicker = startupModel.get('stockTicker');

      if (!el) {
        var orders = startupModel.get('orders');

        el = orders.getContentEl();
      }

      if (!el) {
        return;
      }
        orderUI = this.orderTemplate({
          model: model,
          stockTicker: stockTicker,
          stockExchange: stockExchange,
          tradeAccount: tradeAccount
        });

      $(el).append(orderUI).trigger('create');

      // trick to get new created DOM element
      // let save it to model

      var orderEl = model.el = el.lastElementChild;
      var tapEvent = $G.tapEvent;
      var cancelEl = $('a[data-icon=delete]', orderEl);
      $(cancelEl).on(tapEvent, {me: this}, this.cancelOrder);

      var confirmEl = $('a[data-icon=check]', orderEl);
      $(confirmEl).on(tapEvent, {me: this}, this.confirmOrder);

      // register sliders event handlers
      var sliders = $('.ui-slider input', orderEl),
        priceDigits = sliders[0],
        priceCents = sliders[1],
        size = sliders[2];

      $(size).slider({
        controlchange: function() {
//          console.log('slider change event', arguments);
        },
        start: function(jqEvent) {
          console.log('slider start event', jqEvent);
        },
        stop: function(jqEvent) {
          console.log('slider stop event', jqEvent);
        }
      })
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
