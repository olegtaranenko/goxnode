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
      var target = e.target,
        targetsClasses = target.className,
        classes = targetsClasses.split(' '),
        parent = target.parentNode,
        parentClasses = parent.className,
        re = /p(\d+)/,
        matched = parentClasses.match(re),
        strategy = false;

      if (matched) {
        strategy = parseInt(matched[1]);
      }

      var tradeType = null; // buy or sell
      var tradeUrgent = null; // instant or order
      var currency = null;
      _.each(classes, function(cls) {
        switch (cls) {
          case 'USD':
          case 'BTC':
            currency = cls.toUpperCase();
            break;
          case 'order':
            tradeUrgent = false;
            break;
          case 'instant':
            tradeUrgent = true;
            break;
        }
      });

//      tradeType = 'buy';
//      tradeType = 'sell';

      console.log('Init Trade Action ->', currency + ': ' + strategy + '%, ', (tradeUrgent ? 'instant' : 'order'));
      //debugger;

      var tradeAction = new TradeAction({
        type: tradeType,
        currency: currency,
        size: 0.01 * 10e8,
        strategy: strategy
      });

      var cancelEl = this.createOrderUI(tradeAction);
//      var cancelSel = 'a[data-icon=delete]';
//      var cancelEl = $(cancelSel, el)[0];
      var tapEvent = $.Goxnode().tapEvent;
      $(cancelEl).on(tapEvent, {me: this}, this.doCancel);
    },

    /**
     *
     * @param e
     */
    doCancel: function(e) {
      console.log('doCancel', e);
      var me = e.data.me,
        model = me.model,
        goxEl = model.get('el'),
        action = model.get('activeOrder'),
        actionEl = action.get('el');

      goxEl.removeChild(actionEl);
    },


    /**
     *
     * @param tradeOrder
     */
    createOrderUI: function(tradeOrder) {
      var model = this.model; //StartupModel
      model.set({
        activeOrder: tradeOrder
      });

      var goxEl = $('#gox')[0],
        orderUI = this.orderTemplate({
          tradeAction: tradeOrder
        });


      $(goxEl).append(orderUI).trigger('create');

      var actionEl = goxEl.lastElementChild

      tradeOrder.set({
        el: actionEl
      });

      return actionEl;
    },

    addThread: function() {
      console.log('new thread about to add...');
      alert('addThread');
    },

    showNew: function() {
      console.log('show new threads...');
    },

    render: function() {
      var options = this.options,
        threads = options.threads,
        newMessages = options.newMessages;

      $(this.el).html(this.template({
        threads: threads,
        newMessages: newMessages
      }));

      var goxnode = this.el.lastElementChild,
        model = this.model;

      model.set({
        el: goxnode
      });

      return this;
    }
  });

});
