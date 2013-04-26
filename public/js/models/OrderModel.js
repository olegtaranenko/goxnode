define([
  'backbone', 'CurrencyValueModel'
], function(Backbone, CurrencyValueModel) {

  var _super = Backbone.Model.prototype;
  return Backbone.Model.extend({
    idAttribute: "oid",
    defaults: {
      "oid": '', // guid
      "actions": null,
      "amount": null, //  CurrencyValueModel
      "currency": null, // 'USD', 'EUR', ...

      "date": null, // millis
      "effective_amount": null, //  CurrencyValueModel
      "invalid_amount": null, //  CurrencyValueModel
      "item": null, //  BTC
      "price": null,
      "priority": 0, // nanos
      "status": '', // 'open', 'invalid', ...
      "type": '' // 'ask', 'bid'
    },

    buildHeaderUI: function() {
      var type = this.get('type').toUpperCase(),
        status = this.get('status'),
        amount = this.get('amount').toAmount(),
        price = this.get('price').toPrice(),
        effectiveModel = this.get('effective_amount'),
        effective = effectiveModel.toAmount(),
        displayEffective = effectiveModel.get('display_short'),
        header = type + ' ' + status + ' <u>' + price + '</u> * ';

      header += ' ' + displayEffective;
      if (amount != effective) {
        header += '[' + amount + ']';
      }

      return header;
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
    },

    initialize: function(options) {
      var me = this;

      _.each(['size', 'amount', 'effective_amount'], function(property) {
        var changeEvent = 'change:' + property;

        me.on(changeEvent, function(model, options) {
          var el = model.el,
            headerEl = $(el).find('h2'),
            header = model.buildHeaderUI();

          headerEl.html(header);
        });

      });
    }
  })
});
 