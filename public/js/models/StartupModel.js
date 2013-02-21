/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 11:22
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      id: 0,
      login: '',
      status: 'inactive',
      now: 0      // time in millis
    },
    initialize: function() {

    }
  })
});
