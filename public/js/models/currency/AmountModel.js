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
          var currency = 'BTC';
          me.processAttributes(attributes, currency);
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

 