/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone'
  ,'config'
], function(Backbone, config) {

  var _super = Backbone.Model.prototype,
    $G = $.Goxnode();

  return Backbone.Model.extend({
    defaults: {
      "value": 0.0,             //"10000.00000",
      "value_int": 0,           //"1000000000",
      "display": '$0.00000',    //"$10,000.00000",
      "display_short": '$0.00', //"$10,000.00",
      "currency": ''            //"USD"
    },

    toAmount: function() {
      var value_int = this.get('value_int');
      return value_int / 1E8;
    },

    toPrice: function() {
      var value_int = String(this.get('value_int')),
        decimalPart = value_int.substr(-5),
        decimalLen = decimalPart.length,
        wholeLen = value_int.length,
        intPartLen = wholeLen - decimalLen,
        hasIntPart = intPartLen > 0,
        intPart = hasIntPart ? value_int.substring(0, intPartLen) : '0';

      decimalPart = '000000000000'.substr(0, 5 - decimalPart) + decimalPart;

      return parseFloat(intPart + '.' + decimalPart);
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
//        price: price,
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
/*
      if (price == null ) {
        price = this.toPrice();
      }
      if (digits == null) {
        digits = this.toPriceDigits(price);
      }

      var rest = price - digits;

      return Math.floor((rest + 0.0005) * 1000) / 1000;
*/
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


/*
      if (price == null ) {
        price = this.toPrice();
      }
      if (digits == null) {
        digits = this.toPriceDigits(price, lower);
      }
      if (cents == null) {
        cents = this.toPriceCents(price, lower);
      }

      var rest = price - digits - cents;

      return Math.round(rest * 100000) / 100000;
*/
    },

    constructor: function(attributes, options) {
      var me = this;

      if (attributes != null) {
          // assume we supply value from the UI control. Value or Size
        var ui = options && options.ui;
        if (ui) {
          var value = attributes.value,
            currency = attributes.currency,
            valueFloat = parseFloat(value);

          attributes.value_int = $G.convertToIntValue(valueFloat, currency);
          attributes.value = valueFloat;
          attributes.display_short = valueFloat + ' ' + currency;
        } else {
          var value_int = attributes.value_int;

          if (isNaN(value_int)) {
            value_int = 0;
          }
          attributes.value_int = value_int;
        }
      }

      _super.constructor.apply(me, arguments);
    }

  })
});

 