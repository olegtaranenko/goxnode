define([
  'backbone',
  'Wallets',
  'config'
], function(Backbone, Wallets) {

  var $G = $.Goxnode();
  var _super = Backbone.Model.prototype;

  return Backbone.Model.extend({
    defaults: {
      owner: null, // reference to StartupModel or some else
      Login: '',
      Index: 0,
      Id: '',
      Rights: [],
      Created: '', // "2013-02-03 00:32:50",
      Last_Login: '', // "2013-03-09 19:33:40",
      // Wallets (Collection)
      // it come from mtgox as an Object where key => BTC/USD/EUR
      // will be converted to Array where id == key
      Wallets: null, // Wallets(),
      TradeFee: 0.0, // in %% 0.6 ... 0.45
      Monthly_Volume: null // CurrencyValueModel
    },

    constructor: function(attributes, options) {
      console.log('PrivateInfoModel constructor', attributes, options);
      var me = this,
        wallets = attributes.Wallets,
        monthlyVolume = attributes.Monthly_Volume;

      attributes.Wallets = new Wallets(wallets);
      attributes.Monthly_Volume = monthlyVolume;

      _super.constructor.apply(me, arguments);
    },

    initialize: function(options) {
      console.log('PrivateInfoModel initialize', options);
    }
  })
});