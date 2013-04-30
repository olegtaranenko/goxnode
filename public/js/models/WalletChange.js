/*
 * Created by JetBrains WebStorm.
 * User: user1
 * Date: 29.04.13
 * Time: 11:14
 */
define([
  'backbone', 'CurrencyValueModel'
], function(Backbone, CurrencyValueModel) {

  var _super = Backbone.Model.prototype;
  return Backbone.Model.extend({
    defaults: {
      "op": null, // out(BTC), earned($): SELL BTC; in(BTC), spent($), fee(BTC): BUY BTC
      "amount": null, //  CurrencyValueModel
      "info": '', // information string
      "ref": null, // ???
      "balance": null // CurrencyValueModel
    },

    constructor: function(attributes) {
      var me = this;

      _.each(['amount', 'balance'], function(property) {
        var props = attributes[property];

        if (props) {
          attributes[property] = new CurrencyValueModel(props);
        }
      });

      _super.constructor.apply(me, arguments);
    }
  })
});
