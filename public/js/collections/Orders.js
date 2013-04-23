define(['OrderModel'],

  function(OrderModel) {

    return Backbone.Collection.extend({
      model: OrderModel,
      el: null // div element to perform further manipulation in ui

    });
  }
);
