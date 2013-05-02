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
          type = model.get('type'),
          value = price != null ? parseInt(price.get('value_int')) : 0;

        return type == 'bid' ? 10000000000 - value :  -1 * value;
      },

      initialize: function() {
        var me = this;

        me.on("add", function(model, me, options) {
          console.log("in Orders collection ---- ADD", model);
          var contentEl = me.getContentEl(),
            page = me.owner,
            index = me.indexOf(model),
            orderEls = $(contentEl).find('.trade-order'),
            appendedOrderUIs = orderEls.length,
            insertEl;

          if (index <= appendedOrderUIs) {
            insertEl = orderEls[index];
          }

          page.createOrder(model, insertEl);
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
