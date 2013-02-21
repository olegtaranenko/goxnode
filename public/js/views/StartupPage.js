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
  'text!/templates/startup.html'
], function($, _, Backbone, tpl) {

  return Backbone.View.extend({
    template: _.template(tpl),

    initialize: function () {
      var Goxnode = $.Goxnode(),
        eventsProto = {
          "#nav a.add": 'addThread',
          "#nav a.menu": 'showNew'
        };

      this.events = Goxnode.generateTapEvents(eventsProto);
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
