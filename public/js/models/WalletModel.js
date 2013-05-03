/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone', 'AmountModel'
], function(Backbone, AmountModel) {

  var _super = Backbone.Model.prototype;
  return Backbone.Model.extend({
    defaults: {
      "id": '', // currency name: 'BTC', 'USD', etc
      "Balance": 0.0, //  CurrencyVolumeModel
      "Operations": 0,
      "Daily_Withdraw_Limit": null, //  CurrencyVolumeModel
      "Max_Withdraw": null, //  CurrencyVolumeModel
      "Open_Orders": null, //  CurrencyVolumeModel
      "Monthly_Withdraw_Limit": null //  CurrencyVolumeModel
    },

    constructor: function(attributes, options) {
      var me = this;

      _.each(['Balance', 'Daily_Withdraw_Limit', 'Max_Withdraw', 'Open_Orders', 'Monthly_Withdraw_Limit'], function(property) {
        var props = attributes[property];

        if (props) {
          attributes[property] = new AmountModel(props);
        }
      });

      _super.constructor.apply(me, arguments);
    },

    initialize: function(options) {

    },

    getTablaEl: function() {

    }
  })
});
 