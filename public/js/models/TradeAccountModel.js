/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 26.02.13 16:41
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      base: 'BTC',
      cur: 'USD',
      BTC: 5000230000,
      USD: 100003240
    },

    initialize: function() {

    }
  })
});
