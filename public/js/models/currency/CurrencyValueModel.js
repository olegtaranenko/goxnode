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


    processAttributes: function (attributes, options) {
      var currency = options.currency || attributes.currency;
      var value = attributes.value,
        isValueInt = options.is_int;

      if (value == undefined) {
        value = attributes;
      }

      var valueFloat,
        valueInt;

      if (!isValueInt) {
        valueFloat = parseFloat(value);
        valueInt = $G.convertToIntValue(valueFloat, currency);
      } else {
        valueInt = attributes.value_int;
        if (valueInt == null) {
          valueInt = attributes;
        }
//        valueInt = parseInt(valueInt);
        valueFloat = this.stringDivide(currency == 'BTC' ? 8 : 5, valueInt);
      }
      var valueStr = String(valueFloat);

      attributes.value_int = valueInt;
      attributes.value = valueStr;
      attributes.display_short = this.convertToShort(valueStr, currency);
      attributes.display = attributes.value + ' ' + currency;
      attributes.currency = currency;
    },

    stringDivide: function(exp, valueInt) {
      exp = +exp; // convert to int
      valueInt = valueInt || String(this.get('value_int'));
      if (!_.isString(valueInt)) {
        valueInt = String(valueInt);
      }

      var decimalPart = valueInt.substr(-1 * exp),
        decimalLen = decimalPart.length,
        wholeLen = valueInt.length,
        intPartLen = wholeLen - decimalLen,
        hasIntPart = intPartLen > 0,
        intPart = hasIntPart ? valueInt.substring(0, intPartLen) : '0';

      decimalPart = '000000000000'.substr(0, exp - decimalLen) + decimalPart;

      return parseFloat(intPart + '.' + decimalPart);
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
