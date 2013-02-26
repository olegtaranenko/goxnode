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
          case 'usd':
          case 'btc':
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

      tradeType = (tradeUrgent ? 'instant' : 'order');
      console.log('Init Trade Action ->', currency + ': ' + strategy + '%, ', tradeType);
      //debugger;

      var tradeAction = new TradeAction({
        timestamp: $.now(),
        type: tradeType,
        currency: currency,
        size: 0.01 * 10e8,
        strategy: strategy
      });

      var tradeActionEl = this.createOrderUI(tradeAction);
      var cancelEl = $('a', tradeActionEl);
      var tapEvent = $.Goxnode().tapEvent;
      $(cancelEl).on(tapEvent, {me: this}, this.doCancel);
    },

    /**
     *
     * Cancel Trade Action on user tapping at 'Cancel' button
     *
     * @param e {Event} jQuery event, this => button
     */
    doCancel: function(e) {
      var me = e.data.me,
        model = me.model,
        goxEl = model.get('el'),
        tradeActions = model.get('activeTradeActions'),
        target = e.target;

      do {
        var targetId = target.id,
          done = target.tagName == 'A';

        target = target.parentElement;
      } while (!done);

      var tradeAction = tradeActions.get(targetId),
        actionEl = tradeAction.get('el');

      goxEl.removeChild(actionEl);
      tradeActions.remove(tradeAction);
    },


    /**
     *
     * Using template orderui.html constructs the markup for new Trade Action and append it to #gox form.
     * Reference to created DOM element is stored to TradeAction model
     *
     * @param tradeAction {TradeAction} model
     */
    createOrderUI: function(tradeAction) {
      var model = this.model, //StartupModel
        tradeActions = model.get('activeTradeActions');

      tradeActions.add(tradeAction);

      var goxEl = model.get('el'),
        orderUI = this.orderTemplate({
          tradeAction: tradeAction
        });


      // jqm enhancement
      $(goxEl).append(orderUI).trigger('create');

      // trick to get new created DOM element
      var actionEl = goxEl.lastElementChild;

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
