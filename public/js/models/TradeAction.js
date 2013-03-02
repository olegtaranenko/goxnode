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
      nature: '', // action nature: 'order', 'instant'
//      sizeInt: 0, // BTC * 10E8
      currency: '',
      price: 0.0,
      size: 0.0,
      brutto: 0.0,
      curSize: 0.0,
      curBrutto: 0.0,
      strategy: '', // percent in string: "100", "50", "30"
      el: null // div element to perform further manipulation in ui
    },

    initialize: function() {

    }
  })
});
