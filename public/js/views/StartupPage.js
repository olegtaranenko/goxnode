/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 10:55
 */
define([
  'jquery', 'underscore', 'backbone',
  'text!/templates/startup.html', 'text!/templates/orderui.html',
  'StartupModel', 'TradeAction'
],

function($, _, Backbone,
          tpl, orderUI,
          StartupModel, TradeAction
) {

  return Backbone.View.extend({
    template: _.template(tpl),
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
      var $G = $.Goxnode();

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
      var cancelEl = $('a', tradeActionEl);
      var tapEvent = $G.tapEvent;
      $(cancelEl).on(tapEvent, {me: this}, this.cancelTradeAction);
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
     * Using template orderui.html constructs the markup for new Trade Action and append it to #gox form.
     * Reference to created DOM element is stored to TradeAction model
     *
     * @param tradeAction {TradeAction} model
     * @param stockTicker
     * @param stockExchange
     */
    createTradeAction: function(tradeAction, stockExchange, stockTicker) {
      var model = this.model, //StartupModel
        tradeAccount = model.get('tradeAccount'),
        tradeActions = model.get('activeTradeActions');

      tradeActions.add(tradeAction);

      var actionsEl = tradeAccount.getContentEl(),
        orderUI = this.orderTemplate({
          tradeAction: tradeAction,
          stockExchange: stockExchange,
          stockTicker: stockTicker
        });


      // jqm enhancement
      $(actionsEl).append(orderUI).trigger('create');

      // trick to get new created DOM element
      var actionEl = actionsEl.lastElementChild;

      // let save it to model
      tradeAction.set({
        el: actionEl
      });

      return actionEl;
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
          collapsibleList = collapsibleEl.children(),
          strategiesEl = collapsibleList[1],
          ordersEl = collapsibleList[0];

        tradeAccount.set({el: strategiesEl});
        orders.el = ordersEl;
      });

      return this;
    }
  });

});
