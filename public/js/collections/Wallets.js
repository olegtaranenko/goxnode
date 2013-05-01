/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define(['WalletModel'],

  function(WalletModel) {

    var _super = Backbone.Collection.prototype;
    return Backbone.Collection.extend({
      model: WalletModel,

      constructor: function(attributes) {
        var me = this,
          convertedToArray = [];

        console.log('Wallets constructor', attributes);
        _.each(attributes, function(wallet, walletId) {
          wallet.id = walletId;
          convertedToArray.push(wallet);
        });

        _super.constructor.apply(me, [convertedToArray]);
      },

      initialize: function(attributes, options) {
        console.log('Wallets initialize', attributes, options);
      }
    });
  }
);

 