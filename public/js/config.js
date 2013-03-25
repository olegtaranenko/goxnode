// Use Goxnode namespace as a jQuery plugin to get access from anywhere
define(['socket.io', 'jquery', "settings"],
  function(io, $, clientConfig) {

/*
    $.ajax('/client.json')
      .done(function(data){
        try {
          var clientConfig = eval('statics.config = ' + data);
          console.log('Client configuration loaded successful => ', clientConfig);
        } catch (e) {
          console.error('Failure parsing client.json', e);
        }
      })
      .fail(function() {
        console.error('Error reading client configuration', arguments);
//      })
//      .always(function(data, result, response){
      });
*/

    var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase())),
      tapEvent = mobile ? 'touchstart' : 'vclick';

    var statics = {

      config: clientConfig,
      mobile   : mobile,

      tapEvent : tapEvent,

      actionDateFormat: '%H:%M:%S.%i',

      multipliers: {
        BTC: 100000000,
        USD: 100000
      },

      digits: {
        BTC: 100000,
        USD: 100
      },


      roundFond: function(fond, currency) {
        var digits = this.digits[currency] || 100;
        return Math.round(fond * digits) / digits;
      },


      generateTapEvents: function(events, originalEvents) {
        var ret = originalEvents || {} ;
        $.each(events, function(key, value) {
//          console.log(arguments);
          var eventKey = tapEvent + ' ' + key;
          ret[eventKey] = value;
        });
        return ret;
      }
    };


    $.extend($, {
      Goxnode: function(options) {
        return $.extend(statics, options);
      }
    });

    $.extend($.fn, {
      Goxnode: function (options) {
        return this.each(function () {
          $.Goxnode(options);
        });
      }
    });

    $(document).bind("mobileinit", function () {
      $.mobile.ajaxEnabled = false;
      $.mobile.linkBindingEnabled = false;
      $.mobile.hashListeningEnabled = false;
      $.mobile.pushStateEnabled = false;
      $.mobile.defaultPageTransition = "slide";
      $.mobile.loader.prototype.options.theme = "b";


      // Remove page from DOM when it's being replaced.
      $(document).on("pagehide", "div[data-role='page']", function (event, ui) {
        $(event.currentTarget).remove();
      });
    });
  }
);

