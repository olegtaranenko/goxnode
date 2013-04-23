define([
  'backbone', 'OrderModel'
],
  function(
    Backbone, OrderModel
  ) {

    return Backbone.Collection.extend({
      model: OrderModel,
      comparator: function(model) {
        var price = model.get('price'),
          type = model.get('type');
        var value = price.get('value_int');
        return type == 'bid' ? Number.MAX_VALUE - value :  -1 * value;
      },

      initialize: function() {
        var me = this;

        me.on("add", function(model, me, options) {
          console.log("in Orders collection ---- ADD", model);
          var previousModels = options.previousModels,
            contentEl = me.getContentEl(),
            page = me.owner;

          page.createOrder(model, contentEl);
        });


        me.on("remove", function(model, me, options) {
          console.log("in Orders collection ---- REMOVE");
          var orderEl = model.el,
            ordersEl = me.getContentEl();

          if (orderEl && ordersEl) {
            ordersEl.removeChild(orderEl);
          }
        });


        me.on("change", function(model, options) {
          var changedAttributes = model.changed;

          console.log("in Orders collection ---- CHANGE");
        });
/*
        me.on("reset", function(models, options) {
          var previousModels = options.previousModels,
            contentEl = me.getContentEl();

          _.each(models, function(orderModel) {
            console.log("in Orders collection", orderModel);
            var isNew = false;

            _.each(previousModels, function(prevModel) {

            });
          });
        });
*/
      },

      getContentEl: function() {
        var collapsibleEl = this.el;

        return $(collapsibleEl).find('.ui-collapsible-content')[0];
      },

      el: null, // div element to perform further manipulation in ui
      owner: null // startup model

    });
  }
);
