define([
  'backbone', 'CurrencyValueModel'
], function(Backbone, CurrencyValueModel) {

  var _super = Backbone.Model.prototype;
  return Backbone.Model.extend({
    idAttribute: "oid",
    defaults: {
      "oid": '', // guid
      "actions": null,
      "amount": new CurrencyValueModel(), //  CurrencyValueModel
      "currency": null, // 'USD', 'EUR', ...

      "date": null, // millis
      "effective_amount": new CurrencyValueModel(), //  CurrencyValueModel
      "invalid_amount": new CurrencyValueModel(), //  CurrencyValueModel
      "item": null, //  BTC
      "price": new CurrencyValueModel(),
      "priority": 0, // nanos
      "status": '', // 'open', 'invalid', ...
      "type": '' // 'ask', 'bid'
    },

    constructor: function(attributes) {
      var me = this;

      _.each(['amount', 'effective_amount', 'invalid_amount', 'price'], function(property) {
        var props = attributes[property];

        if (props) {
          attributes[property] = new CurrencyValueModel(props);
        }
      });

      _super.constructor.apply(me, arguments);
    }
  })
});
 