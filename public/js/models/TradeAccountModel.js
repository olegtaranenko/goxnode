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

    getFreeFonds: function(pair) {
      var me = this,
        $G = $.Goxnode(),
        $m = $G.multipliers,
        ret = {},
        partial = false;

      if (_.isString(pair)) {
        pair = [pair];
        partial = true;
      }

      _.each(pair, function(currency, part) {
        var multiplier = $m[currency],
          fond = me.get(currency) / multiplier;

        if (!partial) {
          ret[part] = fond;
        } else {
          ret = fond;
        }
      });

      return ret;
    },


    defaults: {
      strategies: [ "100", "50", "30"],
      BTC: 5000230000,
      USD: 100003240
    },

    initialize: function() {

    }
  })
});
