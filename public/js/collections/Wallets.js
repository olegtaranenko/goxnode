/**
 * The file is a part of MobileWeb project
 * (c) 2013 oDesk Corp all rights reserved
 */
define(['WalletModel'],

  function(WalletModel) {

    return Backbone.Collection.extend({
      model: WalletModel
    });
  }
);

 