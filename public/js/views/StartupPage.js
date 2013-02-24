/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 10:55
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/startup.html',
  'StartupModel'
], function($, _, Backbone, tpl, StartupModel) {

  return Backbone.View.extend({
    template: _.template(tpl),

    model: StartupModel,

    initialize: function () {
      var Goxnode = $.Goxnode(),
        eventsProto = {
          "#nav a.add": 'addThread',
          "#nav a.menu": 'showNew',
          "#gox .attempt > span": 'tradeOrder'
        };

      this.events = Goxnode.generateTapEvents(eventsProto);
    },

    tradeOrder: function(e) {
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
            currency = cls;
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

      console.log('trade Order ->', currency.toUpperCase() + ': ' + strategy + '%, ', (tradeUrgent ? 'instant' : 'order'));
      //debugger;

      if (strategy) {

      }
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
      return this;
    }
  });

});
