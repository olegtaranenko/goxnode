/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone','config'
], function(Backbone, config) {

  var _super = Backbone.Model.prototype,
    $G = $.Goxnode();

  return Backbone.Model.extend({
    defaults: {
      "value": 0.0,             //"10000.00000",
      "value_int": 0,           //"1000000000",
      "display": '',    //"$10,000.00000",
      "display_short": '', //"$10,000.00",
      "currency": ''            //"USD"
    },

    constructor: function(attributes, options) {
      var me = this;

      if (attributes != null) {
        // assume we supply value from the UI control. Value or Size
        var value_int = attributes.value_int;

        if (isNaN(value_int)) {
          value_int = 0;
        }
        attributes.value_int = value_int;
      }

      _super.constructor.apply(me, arguments);
    },

    processAttributes: function (attributes, currency) {
      var value = attributes.value,
        valueFloat = parseFloat(value),
        valueStr = String(valueFloat);

      currency = currency || attributes.currency;

      attributes.value_int = $G.convertToIntValue(valueFloat, currency);
      attributes.value = String(valueFloat);
      attributes.display_short = this.convertToShort(valueStr, currency);
      attributes.display = attributes.value + ' ' + currency;
      attributes.currency = currency;
    },

    convertToShort: function (valueStr, currency) {
      var parsed = valueStr.split('.'),
        intPart = parsed[0],
        decPart = parsed[1] || '00';

      decPart = decPart.substr(0, 2);

      return intPart + '.' + decPart + ' ' + currency;
    }

  })
});

 