define(['OrderModel'],

  function(OrderModel) {

    return Backbone.Collection.extend({
      model: OrderModel

    });
  }
);
