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

  var $G = $.Goxnode(),
    $m = $G.multipliers;

  return Backbone.Model.extend({

    getFreeFonds: function(pair) {
      var me = this,
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
      strategies: $G.config.strategies,
      owner: null // reference to startupModel
    },

    initialize: function(attributes, options) {
      var me = this,
        owner = me.get('owner'),
        cur = options.cur,
        base = options.base,
        modelOptions = {};


      modelOptions[cur] = 0;
      modelOptions[base] = 0;
      _.extend(attributes, modelOptions);

      _.each([cur, base], function(currency) {
        var changeEvent = 'change:' + currency;

        me.on(changeEvent, function(model) {
          _.each(['bid', 'ask'], function (tradeSide) {
            $G.evaluateStrategies(owner, currency, tradeSide);
          });
        });

      });
    }
  })
});
