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
        options = options || {};

        // assume we supply value from the UI control. Value or Size
        var ui = options.ui;

        if (_.isNumber(attributes)) {
          var num = attributes,
            currency = options.currency;

          // TODO multicurrency
          if (currency == null) {
            options.currency = 'USD'
          }

          attributes = {};
          if (options.is_int) {
            attributes.value_int = num;
          } else {
            attributes.value = num;
          }
        }

        if (_.isObject(attributes)) {
          if (ui) {
            me.processAttributes(attributes, options);
          }
        }

      }

      _super.constructor.apply(me, [attributes, options]);
    },

    toPrice: function() {
      return this.stringDivide(5);
    },

    fromParsedPrice: function(parsed) {
      var ret = 0;
      _.each(parsed, function(value) {
        ret += value;
      });
      return ret;
    },

    toParsedPrice: function(options) {
      options = options || {};

      if (options.price == null) {
        options.price = this.toPrice();
      }

      var millis = this.toPriceMillis(options),
        cents = this.toPriceCents(options),
        digits = this.toPriceDigits(options);

      return {
        digits: digits,
        cents: cents,
        millis: millis
      }
    },



    toPriceDigits: function(options) {
      var price = options.price,
        lower = options.lower;

      if (options.price == null) {
        price = options.price = this.toPrice();
      }

      var priceStr = String(price),
        parsed = priceStr.split('.'),
        decimalPart = parsed[1] ? parsed[1]: '0',
        onlyDigit = decimalPart.substr(0, 1),
        checkDigits = parseInt(decimalPart.substr(1, 3)),
        intPart = parsed[0],
        intPartDec = intPart + onlyDigit,
        intDecPartInt = parseInt(intPartDec);

      if (lower) {
        if (checkDigits >= 995) {
          intDecPartInt++;
        }

        intPartDec = String(intDecPartInt);
        onlyDigit = intPartDec.substr(-1);
        intPart = intPartDec.substring(0, intPartDec.length - 1);
      }
      return parseFloat(intPart + '.' + onlyDigit);
    },

    toPriceCents: function(options) {
      var price = options.price,
        lower = options.lower;

      if (options.price == null) {
        price = options.price = this.toPrice();
      }

      var value_int = String(this.get('value_int')),
        decimalPart = value_int.substr(-4, 2),
        nextDigit = parseInt(value_int.substr(-2, 1));

      if (lower && nextDigit >= 5) {
        var decimalPartInt = parseInt(decimalPart);

        decimalPart = (String(++decimalPartInt));
        decimalPart = '00'.substr(0, 2 - decimalPart.length) + decimalPart;
      }
      return parseFloat( '0.0' + String(decimalPart));
    },

    toPriceMillis: function(options) {
      var lower = options.lower,
        value_int = String(this.get('value_int')),
        millisPart = value_int.substr(-2),
        millisPartInt = parseInt(millisPart),
        negative = 1;

      if (millisPartInt > 50 || (lower && millisPartInt == 50)) {
        options.lower = true;
        millisPartInt = 100 - millisPartInt;
        millisPart = String(millisPartInt);
        negative = -1;
      }
      millisPart = '00'.substr(0, 2 - millisPart.length) + millisPart;

      var ret = parseFloat('0.000' + String(millisPart));
      return  ret * negative;
    }

  })
});

 