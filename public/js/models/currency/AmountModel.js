/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone','CurrencyValueModel',
  'config'
], function(Backbone, CurrencyValueModel, config) {

  var _super = CurrencyValueModel.prototype,
    $G = $.Goxnode();

  return CurrencyValueModel.extend({

    constructor: function(attributes, options) {
      var me = this;

      if (attributes != null) {
        // assume we supply value from the UI control. Value or Size
        var ui = options && options.ui;
        if (ui) {
          var value = attributes.value,
            currency = 'BTC',
            valueFloat = parseFloat(value),
            valueStr = String(valueFloat),
            parsed = valueStr.split('.'),
            intPart = parsed[0],
            decPart = parsed[1] || '00';

          decPart = decPart.substr(0, 2);

          attributes.value_int = $G.convertToIntValue(valueFloat, currency);
          attributes.value = String(valueFloat);
          attributes.display_short = intPart + '.' + decPart + ' ' + currency;
        }
      }

      _super.constructor.apply(me, arguments);
    },

    toAmount: function() {
      var value_int = this.get('value_int');
      return value_int / 1E8;
    }

  })
});

 