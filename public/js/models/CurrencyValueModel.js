/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone'
], function(Backbone) {

  var _super = Backbone.Model.prototype;

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

    constructor: function(attributes) {
      var me = this;

      if (attributes != null) {
        var value_int = attributes.value_int;
        if (isNaN(value_int)) {
          value_int = 0;
        }
        attributes.value_int = value_int;
      }

      _super.constructor.apply(me, arguments);
    }

  })
});

 