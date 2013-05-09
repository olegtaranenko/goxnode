define([
  'backbone', 'CurrencyValueModel', 'AmountModel', 'PriceModel'
], function(Backbone, CurrencyValueModel, AmountModel, PriceModel) {

  var _super = Backbone.Model.prototype;
  return Backbone.Model.extend({
    idAttribute: "oid",
    defaults: {
      "collapsed": true,
      "phantom": false,
      "ontop": false,
      "virtual": false,
      "hold": false,
      "ontopId": null, // id of order connected to bidder

      "oid": '', // guid
      "oldOid": '', // guid of previous order, which is replaced with oid
      "actions": null,
      "amount": new AmountModel(), //  CurrencyValueModel
      "currency": null, // 'USD', 'EUR', ...

      "date": null, // millis
      "effective_amount": null, //  CurrencyValueModel
      "invalid_amount": null, //  CurrencyValueModel
      "item": null, //  BTC
      "price": new PriceModel(),
      "priority": 0, // nanos
      "status": '', // 'open', 'invalid', ...
      "type": '' // 'ask', 'bid'
    },


    constructor: function(attributes) {
      this.processAttributes(attributes);

      _super.constructor.apply(this, arguments);
      attributes = this.attributes;
      this.originalValues = _.extend({}, _.pick(attributes, 'hold', 'ontop', 'virtual'));
    },

    processAttributes: function (attributes) {
      var me = this;


      _.each(['amount', 'effective_amount', 'invalid_amount', 'price'], function (property) {
        var props = attributes[property];

        if (props) {
          if (!(props instanceof CurrencyValueModel)) {
            if (property == 'price') {
              attributes[property] = new PriceModel(props);
            } else {
              attributes[property] = new AmountModel(props);
            }
          }
        }
      });
      return attributes;
    },


    initialize: function(options) {
      var me = this;

      _.each(['ontop', 'hold', 'virtual'], function(property) {
        var changeEvent = 'change:' + property,
          funcName = property + 'Handler',
          fn = me[funcName];

        me.on(changeEvent, fn);

      });

      _.each(['amount', 'effective_amount', 'price'], function(property) {
        var changeEvent = 'change:' + property;

        me.on(changeEvent, function(model, value, options) {
          var price = null,
            amount = null;

//          console.log('changeEvent %s, value ', changeEvent, value);
          if (property == 'price') {

            var collection = me.collection,
              priceInt = value;

            if (value instanceof PriceModel) {
              priceInt = value.get('value_int')
            }

            me.changeSliders(priceInt);

            collection.sort();
            price = value;
          } else {
            amount = value;
          }

          me.changeHeader(amount, price);
        });

      });

      me.on('change:oldOid', function(model, value, options) {
        var prevValue = model.previous('oldOid');
        if (!_.isEmpty(value)) {
          var collection = me.collection;
          collection.remove(value);
        }
      });

      me.on('change:collapsed', function(model, value, options) {
        var el = model.el,
          $collapsible = $(el);

        $collapsible.collapsible({ collapsed: value });
      });

      me.on('change:status', function(model, value, options) {
        me.changeTheme(model);
        me.tweakConfirmButton(value == 'editing' || value == 'new');

        var previousStatus = this.previous('status');

        if (value == 'editing') {
          var originalValues = me.originalValues;
          me.originalValues = _.extend(originalValues, {
            status: previousStatus,
            price: me.get('price'),
            amount: me.get('amount')
          });

        } if (previousStatus == 'editing' && value == 'revert') {
//          console.log('revert sliderVal, originalvalues', this.originalValues);
          model.set(this.originalValues);
          model.dirtyPrice(false);

          var sliders = model.allSliders;

          _.each(sliders, function(sliderOptions, root) {
            var sliderEl = sliderOptions.el,
              $slider = $(sliderEl),
              sliderVal = sliderOptions.value,
              attr = sliderOptions.attr;

            _.each(attr, function(value, key) {
              $slider.attr(key, value)
            });
            $(sliderEl).val(sliderVal);

            $(sliderEl).slider("refresh");
          });

        }
      });

    },


    ontopHandler: function(model, value, options) {
      this.refreshCheckbox(value, 'ontop');
    },

    holdHandler: function(model, value, options) {
      var prevValue = model.previous('hold');
      this.refreshCheckbox(value, 'hold');

    },

    virtualHandler: function(model, value, options) {
      this.refreshCheckbox(value, 'virtual');
    },

    setCheckboxValue: function(value, $checkbox) {
      $checkbox.prop('checked', value ? 'checked' : '');
      $checkbox.checkboxradio('refresh');
    },

    refreshCheckbox: function(value, name) {
      var contentEl = this.el,
        selector = '[name=' + name + ']',
        checkboxEl = $(contentEl).find(selector),
        $checkbox = $(checkboxEl);

      this.setCheckboxValue(value, $checkbox);
    },


    changeSliders: function(priceModel) {
      var model = this,
        allSliders = model.allSliders;

      if (!(priceModel instanceof PriceModel)) {
        priceModel = new PriceModel(priceModel, {
          ui: true,
          is_int: _.isNumber(priceModel) && priceModel > 9999
        });
      }

      var parsedPrice = priceModel.toParsedPrice({
          lower: true
        });

      _.each(allSliders, function(info, sliderName){
        var slider = $(info.el);

        if (info.isPrice) {
          var value = parsedPrice[sliderName],
            oldValue = slider.val();
          if (oldValue != value) {
            slider.val(value);
            slider.slider('refresh');
          }
        }
      });


      return priceModel;
    },

    dirtyPrice: function() {
      var me = this,
        value = arguments[0];

      if (value === undefined) {
        return me._dirtyPrice;
      }
      me._dirtyPrice = value;
      return me;
    },

    tweakOriginalPrice: function(parsedPrice) {
      var me = this,
        originalValues = this.originalValues,
        dirty = me.dirtyPrice();

      if (!dirty) {
        _.each(parsedPrice, function (value, part) {
          me.dirtyPrice(false);
        });
      }
    },

    changeHeader: function (amount, price) {
      var model = this,
        el = model.el,
        headerEl = $(el).find('h2'),
        header = model.buildHeaderUI(amount, price),
        innerEl = headerEl.find('span.ui-btn-text');

      $(innerEl).html(header);
    },


    changeTheme: function () {
      var model = this,
        el = model.el,
        status = model.get('status'),
        theme = model.getOrderSwatchTheme(),
        buttonEl = $(el).find('h2 a');

      if (status == 'invalid' || status == 'open') {
        $(buttonEl).buttonMarkup({theme: theme});
      }
    },

    tweakConfirmButton: function (editing) {
      var me = this;

      var confirmEl = $(me.confirmButtonEl());

      $(confirmEl).css('visibility', editing ? 'visible' : 'hidden');
    },


    tweakUIByHold: function() {
      this.set({
        status: 'hold'
      });

      this.tweakConfirmButton(false);
      this.changeTheme();
      this.changeHeader();
    },

    dehydrate: function(defaults) {
      defaults = defaults || {};

      var attributes = _.pick(this.attributes, 'collapsed', 'price', 'amount', 'type', 'hold', 'ontop', 'virtual', 'item', 'currency'),
        permanent = attributes.hold || attributes.ontop || attributes.virtual;

      defaults.modelType = 'Order';
      defaults.permanent = permanent;

      return _.extend(attributes, defaults);
    },


    hydrate: function(attributes) {
      return this.processAttributes(attributes);
    },

    tweakBidderUI: function(options) {
      var amountInt = options.amount_int,
        priceInt = options.price_int;

      this.changeHeader(amountInt, priceInt);
      this.changeSliders(priceInt);
    },

    buildHeaderUI: function(amount, price) {

      var amountModel = null,
        priceModel = null,
        effectiveModel = null;

      if (amount == null) {
        effectiveModel = this.get('effective_amount');
        amountModel = this.get('amount');
        amount = amountModel.toAmount();

      } else if (!(amount instanceof AmountModel)) {
        amountModel = new AmountModel(amount, {
          ui: true,
          is_int: true
        });
      } else {
        amountModel = amount;
      }

      if (price == null) {
        priceModel = this.get('price');
      } else if ( !(price instanceof PriceModel) ){
        priceModel = new PriceModel(price, {
          ui: true,
          is_int: true
        });
      } else {
        priceModel = price;
      }

      price = priceModel.toPrice();

      var $G = $.Goxnode(),
        type = this.get('type').toUpperCase(),
        status = this.get('status'),
        editing = status == 'editing',


        effective = effectiveModel ? effectiveModel.toAmount() : 0,

        model = (effective > 0 && !editing)? effectiveModel : amountModel,
        total = $G.roundFond(model.toAmount() * price),

        display = model.get('display_short'),
        header = type + ' ' + status + ' <u>' + price + '</u> * ';

      header += ' ' + display;
      if (!editing && (amount != effective && effective > 0)) {
        header += ' [' + amountModel.get('display_short') + ']';
      }

      header += '<span style="float:right">' + total + '</span>';
      return header;
    },


    cancelButtonEl: function() {
      var orderEl = this.el;

      return $('a[data-icon=delete]', orderEl);
    },


    confirmButtonEl: function() {
      var orderEl = this.el;

      return $('a[data-icon=check]', orderEl);
    },


    getOrderSwatchTheme: function() {
      var orderType = this.get('type'),
        orderStatus = this.get('status'),
        hold = this.get('hold'),

        orderTheme;

      if (orderStatus == 'invalid') {
        orderTheme = 'c';
      } else {
        if (hold) {
          orderTheme = 'd';
        } else if (orderType == 'ask') {
          orderTheme = 'b';
        } else {
          orderTheme = 'e';
        }
      }

      return orderTheme;
    }
  })
});
