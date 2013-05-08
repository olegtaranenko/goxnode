/*
 * Created by JetBrains WebStorm.
 * User: user1
 * Date: 08.05.13
 * Time: 08:40
 */
define([
  'backbone','OrderModel', 'AmountModel', 'PriceModel',
  'config'
], function(Backbone, OrderModel, AmountModel, PriceModel,
            config) {

  var _super = OrderModel.prototype,
    $G = $.Goxnode();

  return OrderModel.extend({
    constructor: function(attributes, options) {
      var me = this;

      if (attributes) {
        var createAttributes = _.pick(attributes, 'type', 'ontop', 'hold', 'virtual');
        var valueOptions = {ui: true, is_int: true};

        _.extend(createAttributes, {
          amount: new AmountModel(attributes.amount_int, valueOptions),
          price: new PriceModel(attributes.price_int, valueOptions),
          oid: attributes.bidderId,
          ontopId: attributes.oid || attributes.cancellingOid,
          //TODO multicurrency
          item: 'BTC',
          currency: 'USD',
          ontop: true,
          status: 'ontop'
        })

      }
      _super.constructor.apply(me, [createAttributes, options]);
    }
  })
});
