/**
 * The file is a part of Goxnode project
 */
require.config({
  baseUrl: 'js',
  paths: {
    "socket.io": 'lib/socket.io',
    "localhost": 'localhost',
    config: 'config',
    backbone: 'lib/backbone',
    jquery: 'lib/jquery',
    jaauldeCookies: 'lib/jaaulde.cookies',
    jqueryCookiesPlugin: 'lib/plugins/jquery.cookies',
    mobile: 'lib/jquery.mobile',
    underscore: 'lib/underscore',
    underscoreDate: 'lib/plugins/underscore.date',
    text: 'lib/plugins/text',
    StartupPage: 'views/StartupPage',
    StartupModel: 'models/StartupModel',
    TradeAccountModel: 'models/TradeAccountModel',
    TradeAction: 'models/TradeAction',
    StockExchangeModel: 'models/StockExchangeModel',
    StockTickerModel: 'models/StockTickerModel',
    TradeActions: 'collections/TradeActions'
  }
});

requirejs.config({
  shim: {
    'underscore': {
      deps: [],
      exports: '_'
    },
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'jquery': {
      deps: ['underscore'],
      exports: '$'
    },
    "jaauldeCookies": {
      deps: ['jquery']
    },
    "jqueryCookiesPlugin": {
      deps: ['jaauldeCookies']
    },
    "config": {
      deps: ['jquery'],
      exports: 'config'
    },
    'mobile': {
      deps: ['config', 'jquery'],
      exports: 'mobile'
    },
    underscoreDate: {
      deps: ['underscore']
    },
    text: {
      deps: ['backbone'],
      exports: 'text'
    },
    StartupModel: {
      deps: ['backbone'],
      exports: 'StartupModel'
    },
    StartupPage: {
      deps: ['backbone', 'config', 'StartupModel'],
      exports: 'StartupPage'
    },
    router: {
      deps: [
        'StartupPage'
      ],
      export: 'router'
    },
    localhost: {
      deps: [
        'socket.io'
      ],
      export: 'localhost'
    }
  }
});

require([
  'backbone',
  'router',
  'jqueryCookiesPlugin',
  'underscore', 'underscoreDate',
  'mobile',
  'text', 'jquery', 'config',
  'socket.io', 'localhost'
],

function(Backbone, AppRouter) {
  $(document).ready(function () {
    console.log('document ready');
    app = new AppRouter({
      pushState: true
    });
    Backbone.history.start();
  });
});
