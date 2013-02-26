/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 */

define(['TradeAction'], function(TradeAction) {

    return Backbone.Collection.extend({
      model: TradeAction

//      url: '/api/v0/threads.json',
//
//      parse: function(response) {
//        return response.threads
//      }
    });
  }
);
