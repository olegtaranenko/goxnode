/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 24.02.13 02:29
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      timestamp: 0, // millis
      type: '', // 'bid' or 'ask'
      sizeInt: 0, // BTC * 10E8
      strategy: '', // instant or order
      el: null // div element to perform further manipulation in ui
    },

    initialize: function() {

    }
  })
});