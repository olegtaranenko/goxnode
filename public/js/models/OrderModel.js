define([
  'backbone', 'CurrencyValueModel'
], function(Backbone, CurrencyValueModel) {

  var _super = Backbone.Model.prototype;
  return Backbone.Model.extend({
    idAttribute: "oid",
    defaults: {
      "oid": '', // guid
      "actions": null,
      "amount": null, //  CurrencyValueModel
      "currency": null, // 'USD', 'EUR', ...

      "date": null, // millis
      "effective_amount": null, //  CurrencyValueModel
      "invalid_amount": null, //  CurrencyValueModel
      "item": null, //  BTC
      "price": null,
      "priority": 0, // nanos
      "status": '', // 'open', 'invalid', ...
      "type": '' // 'ask', 'bid'
    },

    getOrderTotal: function() {
      var
        price = this.get('price').toPrice(),
        effective = this.get('effective_amount').toAmount();

    },

    buildHeaderUI: function() {
      var $G = $.Goxnode(),
        type = this.get('type').toUpperCase(),
        status = this.get('status'),
        editing = status == 'editing',
        price = this.get('price').toPrice(),

        amountModel = this.get('amount'),
        amount = amountModel.toAmount(),

        effectiveModel = this.get('effective_amount'),
        effective = effectiveModel.toAmount(),

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
        orderTheme;

      if (orderStatus == 'invalid') {
        orderTheme = 'c';
      } else {
        if (orderType == 'ask') {
          orderTheme = 'e';
        } else {
          orderTheme = 'b';
        }
      }

      return orderTheme;
    },


    constructor: function(attributes) {
      var me = this;

      _.each(['amount', 'effective_amount', 'invalid_amount', 'price'], function(property) {
        var props = attributes[property];

        if (props) {
          attributes[property] = new CurrencyValueModel(props);
        }
      });

      _super.constructor.apply(me, arguments);
    },

    initialize: function(options) {
      var me = this;

      _.each(['amount', 'effective_amount', 'price'], function(property) {
        var changeEvent = 'change:' + property;

        me.on(changeEvent, function(model, value, options) {
//          console.log('changeEvent %s, value ', changeEvent, value);
          changeHeader(model);
        });

      });

      me.on('change:status', function(model, value, options) {
        changeTheme(model);
        tweakConfirmButton(value == 'editing');

        var previousStatus = this.previous('status');

        if (value == 'editing') {
          this.original = {
            status: previousStatus,
            price: this.get('price'),
            amount: this.get('amount')
          };

        } if (previousStatus == 'editing' && value == 'revert') {
//          console.log('revert sliderVal, original', this.original);
          model.set(this.original);

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

          delete this.original;
        }
      });

      function tweakConfirmButton(editing) {
        var confirmEl = $(me.confirmButtonEl());

        $(confirmEl).css('visibility', editing ? 'visible' : 'hidden');
      }

      function changeHeader(model) {
        var el = model.el,
          headerEl = $(el).find('h2'),
          header = model.buildHeaderUI(),
          innerEl = headerEl.find('span.ui-btn-text');

        $(innerEl).html(header);
      }

      function changeTheme(model) {
        var el = model.el,
          status = model.get('status'),
          theme = model.getOrderSwatchTheme(),
          buttonEl = $(el).find('h2 a');

        if (status == 'invalid' || status == 'open') {
          $(buttonEl).buttonMarkup({theme: theme});
        }
      }


    }
  })
});
 