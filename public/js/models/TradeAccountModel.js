/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 26.02.13 16:41
 */
define([
  'backbone', 'config'
], function(Backbone, config) {

  var $G = $.Goxnode();

  return Backbone.Model.extend({

    defaults: {
      strategies: $G.config.strategies,
      el: null, // reference to the collapsible element with strategies
      owner: null // reference to startupModel
    },

    initialize: function(attributes, options) {
      var me = this,
        cur = options.cur,
        base = options.base,
        modelOptions = {};


      modelOptions[cur] = 0;
      modelOptions[base] = 0;
      _.extend(attributes, modelOptions);

      _.each([cur, base], function(currency) {
        var changeEvent = 'change:' + currency;

        me.on(changeEvent, function(model) {
          console.log('Change event in TradeAccount', changeEvent, model);
          var owner = me.owner;  // StartupModel
/*
          if (owner) {
            var personalInfo = owner.get('personalInfo'),
              wallets = personalInfo ? personalInfo.get('Wallets') : false;

            if (wallets) {
              var wallet = wallets.get(currency);

              if (wallet) {
                var showFondEl = wallet.getTablaEl();
              }
            }

          }
*/


//          $(showFondEl).html();
          _.each(['bid', 'ask'], function (tradeSide) {
            $G.evaluateStrategies(owner, currency, tradeSide);
          });
        });

      });
    },


    getFreeFonds: function(pair) {
      var me = this,
        ret = {},
        partial = false;

      if (_.isString(pair)) {
        pair = [pair];
        partial = true;
      }

      _.each(pair, function(currency, part) {
        var balance = me.get(currency),
          amount = balance ? balance.get('value') : 0,
          multipliers = $G.multipliers,
          value = amount / multipliers[currency];

        if (!partial) {
          ret[part] = amount;
        } else {
          ret = amount;
        }
      });

      return ret;
    },


    getContentEl: function() {
      var collapsibleEl = this.get('el');

      return $(collapsibleEl).find('.ui-collapsible-content')[0];
    }
  })
});
