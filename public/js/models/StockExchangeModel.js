/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 27.02.13 16:34
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      base: 'BTC',
      cur: 'USD',
      stockFee: 0.994,
      baseQuant: 0.00001,
      baseMinTrade: 0.01,
    },

    initialize: function() {

    }
  })
});
