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
      var value_int = this.get('value_int');
      return value_int / 1E5;
    },

    fromParsedPrice: function(parsed) {
      var ret = 0;
      _.each(parsed, function(value) {
        ret += value;
      });
      return ret;
    },

    toParsedPrice: function(price) {
      if (price == null) {
        price = this.toPrice();
      }

      var digits = this.toPriceDigits(price),
        cents = this.toPriceCents(price, digits),
        millis = this.toPriceMillis(price, digits, cents);

      return {
//        price: price,
        digits: digits,
        cents: cents,
        millis: millis
      }
    },

    toPriceDigits: function(price) {
      if (price == null) {
        price = this.toPrice();
      }

      return Math.floor((price) * 10) / 10;
    },

    toPriceCents: function(price, digits) {
      if (price == null ) {
        price = this.toPrice();
      }
      if (digits == null) {
        digits = this.toPriceDigits(price);
      }

      var rest = price - digits;

      return Math.floor((rest) * 1000) / 1000;
    },

    toPriceMillis: function(price, digits, cents) {
      if (price == null ) {
        price = this.toPrice();
      }
      if (digits == null) {
        digits = this.toPriceDigits(price);
      }
      if (cents == null) {
        cents = this.toPriceCents(price);
      }

      var rest = price - digits - cents;

      return Math.round(rest * 100000) / 100000;
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

 