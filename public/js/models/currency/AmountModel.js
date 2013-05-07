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

      var ui = options && options.ui,
        isValueInt = options && options.is_int;

      if (isValueInt) {
        attributes = {
          value_int: attributes
        };
      }

      if (_.isObject(attributes)) {
        if (ui) {
          options.currency = 'BTC';
          me.processAttributes(attributes, options);
        }
      }

      _super.constructor.apply(me, [attributes, options]);
    },

    toAmount: function() {
      return this.stringDivide(8);
    }

  })
});

 