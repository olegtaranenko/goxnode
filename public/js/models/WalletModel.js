/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      "Balance": 0.0,
      "Operations": 0,
      "Daily_Withdraw_Limit": null, //  CurrencyVolumeModel
      "Max_Withdraw": null, //  CurrencyVolumeModel
      "Open_Orders": null, //  CurrencyVolumeModel
      "Monthly_Withdraw_Limit": null //  CurrencyVolumeModel
    }
  })
});
 