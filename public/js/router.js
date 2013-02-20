/**
 * The file is a part of Goxnode project
 */
define([
  'backbone', 'jquery', 'underscore'
],
  function(Backbone, $, _, StartPage) {

    return Backbone.Router.extend({

      routes: {
        "": 'startpage',
        "list(/:opt)": 'startpage',
        "details/:id": 'details'
      },

      initialize: function () {
        this.firstPage = true;
      },


      startpage: function (opt) {
/*
        $.mobile.showPageLoadingMsg();

        var lastVisited = $.cookies.get('lastvisited'),
          initialLoad = lastVisited == null;

        var webView = this,
          back = opt == 'back';

        var threads = new ThreadsCollection();

        threads.fetch({
          params: {
            offset: 0,
            count: 20
          },

          success: function(collection, response, options) {

            console.log('threads loaded:', response);

            var newMessages = 0;
            if (initialLoad) {
              newMessages = collection.length;
            } else {
              var now = (new Date()).getTime();

              collection.each(function(thread) {
                var updated = thread.get('updated');
                if (updated > lastVisited) {
                  newMessages++;
                }
              });
            }


            var page = new StartPage({
              threads: collection.models,
              newMessages: newMessages
            });
            webView.changePage(page, back);

            $.mobile.hidePageLoadingMsg();
          },
          error: function() {
            console.error('error loading threads!');
          }
        });
*/
      }

    });
  }
);
 