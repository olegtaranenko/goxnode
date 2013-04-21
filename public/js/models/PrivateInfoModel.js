define([
  'backbone'
], function(Backbone) {

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
      Wallets: null,
      TradeFee: 0.0, // in %% 0.6 ... 0.45
      Monthly_Volume: null // CurrencyValueModel
    }
  })
});