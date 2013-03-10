/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define([
  'backbone'
], function(Backbone) {

  return Backbone.Model.extend({
    defaults: {
      "value": 0.0,             //"10000.00000",
      "value_int": 0,           //"1000000000",
      "display": '$0.00000',    //"$10,000.00000",
      "display_short": '$0.00', //"$10,000.00",
      "currency": ''            //"USD"
    }
  })
});

 