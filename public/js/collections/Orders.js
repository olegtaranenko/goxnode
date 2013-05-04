define([
  'backbone', 'OrderModel','config'
],
  function(
    Backbone, OrderModel
  ) {

    var $G = $.Goxnode();

    return Backbone.Collection.extend({
      model: OrderModel,
      permanentOrders: {},

      comparator: function(model) {
        var price = model.get('price'),
          type = model.get('type'),
          value = price != null ? parseInt(price.get('value_int')) : 0;

        return type == 'bid' ? 10000000000 - value :  -1 * value;
      },


      initialize: function() {
        var me = this;

        // init permanent Orders

        var i = 0,
          ordersPrototypes = {},
          sKey, hasPermanent = false;

        while (sKey = localStorage.key(i)) {
          var proto = localStorage.getItem(sKey),
            parsed = JSON.parse(proto);

          if (parsed && parsed.modelType == 'Order' && parsed.permanent) {
            delete parsed.modelType;
            ordersPrototypes[sKey] = parsed;
            hasPermanent = true;
          }
          i++;
        }

        if (hasPermanent) {
          this.permanentOrders = ordersPrototypes;
        }



        me.on("sort", function(collection, options) {
          var attributes = options._attrs,
            status = attributes ? attributes.status : false,
            force = options.force;

          if (status == 'pending' || force) {
            console.log('Collection sort triggered', options);
            var contentEl = me.getContentEl(),
              divCollection = $(contentEl).find('[data-role=collapsible]');

            collection.each(function(model, index) {
              console.log('collection::each', model, index);
              var modelEl = model.el,
                oid = model.id,
                div = divCollection[index],
                divId = div ? div.id : null;

              if (divId != null && divId != oid) {
                var movedDiv = findDivById(oid);

                if (movedDiv) {
                  $(div).before($(movedDiv));
                  divCollection = $(contentEl).find('[data-role=collapsible]');
                }
              }

              function findDivById(id) {
                var ret = null;
                _.some(divCollection, function(d) {
                  if (d.id == id) {
                    ret = d;
                    return true;
                  }
                  return false;
                });
                return ret;
              }

            });
          }
        });

        me.on("add", function(model, me, options) {
          console.log("in Orders collection ---- ADD", model);
          var page = me.owner,
            oldOid = model.get('oldOid'),
            id = model.id,
            permanentInfo = me.permanentOrders[id];

          $G.restoreOrderSettings(model, oldOid, permanentInfo);

          if (!_.isEmpty(oldOid)) {
            this.remove(oldOid);
          }

          page.createOrder(model);

        });


        me.on("remove", function(model, me, options) {
//          console.log("in Orders collection ---- REMOVE");
          this.removeOrderUI(model);
        });


        me.on("change", function(model, options) {
          var changedAttributes = model.changed;

//          console.log("in Orders collection ---- CHANGE");
        });
      },


      restorePermanentOrders: function() {
        var me = this;

        _.each(this.permanentOrders, function(attributes, oid) {
          var exists = me.get(oid);

          if (!exists && attributes.hold) {
            attributes.oid = oid;
            attributes.status = 'hold';
            attributes.collapsed = true;
            me.add(attributes);
          }
        });
        // one off
        delete this.permanentOrders;
      },

      /**
       *
       * @param model {OrderModel|oid}
       */
      removeOrderUI: function (model) {
        if (_.isString(model)) {
          model = this.get(model);
        }

        try {
          var me = this,
            orderEl = model.el,
            ordersEl = me.getContentEl();

          if (orderEl && ordersEl) {
            ordersEl.removeChild(orderEl);
          }
        } catch (e) {
          // nothing, have to fix may be
        }
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
