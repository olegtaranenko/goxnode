define([
  'backbone', 'CurrencyValueModel'
], function(Backbone, CurrencyValueModel) {

  return Backbone.Model.extend({
    defaults: {
      "actions": null,
      "amount": new CurrencyValueModel(), //  CurrencyValueModel
      "currency": null, // 'USD', 'EUR', ...

      "date": null, // millis
      "effective_amount": new CurrencyValueModel(), //  CurrencyValueModel
      "invalid_amount": new CurrencyValueModel(), //  CurrencyValueModel
      "item": null, //  BTC
      "oid": '', // guid
      "price": new CurrencyValueModel(),
      "priority": 0, // nanos
      "status": '', // 'open', 'invalid', ...
      "type": '' // 'ask', 'bid'
    },

    initialize: function(attributes) {

    }
  })
});
 