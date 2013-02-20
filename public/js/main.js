/**
 * The file is a part of Goxnode project
 */
require.config({
  baseUrl: 'js',
  paths: {
    config: 'config',
    backbone: 'lib/backbone',
    jquery: 'lib/jquery',
    jaauldeCookies: 'lib/jaaulde.cookies',
    jqueryCookiesPlugin: 'lib/plugins/jquery.cookies',
    mobile: 'lib/jquery.mobile',
    underscore: 'lib/underscore',
    underscoreDate: 'lib/plugins/underscore.date',
    text: 'lib/plugins/text'
  }
});

requirejs.config({
  shim: {
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
    }
  }
});

require([
  'backbone',
  'router',
  'jqueryCookiesPlugin',
  'underscore', 'underscoreDate',
  'mobile',
  'text', 'jquery', 'config'
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
