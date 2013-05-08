/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 21.02.13 10:55
 */
define([
  'jquery', 'underscore', 'backbone',
  'text!/templates/startup.html', 'text!/templates/actionui.html', 'text!/templates/orderui.html',
  'StartupModel', 'TradeAction', 'PriceModel', 'AmountModel', 'OrderModel', 'BidderModel'
],

function($, _, Backbone,
          tpl, actionUI, orderUI,
          StartupModel, TradeAction, PriceModel, AmountModel, OrderModel, BidderModel
) {

  var $G = $.Goxnode();
  return Backbone.View.extend({
    template: _.template(tpl),
    actionTemplate: _.template(actionUI),
    orderTemplate: _.template(orderUI),

    /**
     *
     * @param config
     */
    initialize: function (config) {
      var Goxnode = $.Goxnode(),
        eventsProto = {
          "#nav a.add": 'addThread',
          "#nav a.menu": 'showNew',
          ".attempt > span": 'tradeAction',
          ".currency-state > span": 'newOrder'
        };

      this.events = Goxnode.generateTapEvents(eventsProto);
      this.model = config.model;
    },
    
    newOrder: function(e) {
      console.log('newBuy', e);
      var target = $(e.target),
        allClasses = target.attr('class').split(' '),
        typeOrder, actionNature;

      _.each(allClasses, function(cls) {
        switch (cls) {
          case 'bid':
          case 'ask':
            typeOrder = cls;
            break;
          case 'ticker':
            actionNature = 'ORDER';
            break;
          case 'usd':
          case 'btc':
            actionNature = 'INSTANT';
            break;
        }

      });
      var model = this.model,
        tradeAccount = model.get('tradeAccount'),
        stockExchange = model.get('stockExchange'),
        stockTicker = model.get('stockTicker'),
        orders = model.get('orders');


      var currency = typeOrder == 'bid' ? 'USD' : 'BTC',
        oppositeCurrency = currency == 'USD' ? 'BTC' : 'USD';

      var fonds = tradeAccount.getFonds(stockTicker.get('bid')),
        fond = fonds[currency],
        noNullFond = fond <= 0.01 ? 0.01 : fond,
        amountModel = new AmountModel({
          value: noNullFond,
          currency: currency
        }, {
          ui: true,
          amount: true
        }),
        priceModel = new PriceModel({
          value: ((actionNature == 'ORDER' && typeOrder == 'ask') || (actionNature == 'INSTANT' && typeOrder == 'bid')) ? stockTicker.get('ask') : stockTicker.get('bid'),
          currency: 'USD'
        }, {
          ui: true
        }),
        params = {
          oid: Math.uuid().toLowerCase(),
          phantom: true,
          type: typeOrder,
          amount: amountModel,
          status: 'new',
          collapsed: false,
          price: priceModel,
          item: 'BTC',
          currency: 'USD'
        },
        orderModel = new OrderModel(params);

      orders.add(orderModel);
    },

    /**
     *
     * @param e
     */
    tradeAction: function(e) {

      var target = e.target,
        targetsClasses = target.className,
        classes = targetsClasses.split(' '),
        parent = target.parentNode,
        parentClasses = parent.className,
        re = /p(\d+)/,
        matched = parentClasses.match(re),
        strategy = false,
        strategyPercent = false;

      if (matched) {
        strategy = matched[1];
        strategyPercent = parseInt(strategy);
      }

      var actionNature = null; //(tradeUrgent ? 'instant' : 'order');
      var currency = null,
        side;
      _.each(classes, function(cls) {
        switch (cls) {
          case 'bid':
          case 'ask':
            side = cls;
            break;
          case 'order':
          case 'instant':
            actionNature = cls.toUpperCase();
            break;
        }
      });

      console.log('Init Trade Action ->', currency + ': ' + strategyPercent + '%, ', actionNature);

      var model = this.model,
        tradeAccount = model.get('tradeAccount'),
        stockExchange = model.get('stockExchange'),
        stockTicker = model.get('stockTicker');


      currency = side == 'bid' ? 'USD' : 'BTC';
      var params = stockExchange.getNatureBaseSize(tradeAccount, stockTicker, actionNature, strategy, currency);

      var tradeAction = new TradeAction({
        timestamp: $.now(),
        nature: actionNature,
        currency: currency,
        price: params.tradePrice,
        size: params.baseFond,
        brutto: params.baseBrutto,
        curSize: params.currencyFond,
        curBrutto: params.currencyBrutto,
        strategy: strategyPercent
      });

      var tradeActionEl = this.createTradeAction(tradeAction, stockExchange, stockTicker);
    },

    /**
     *
     * Cancel Trade Action on user tapping at 'Cancel' button
     *
     * @param e {Event} jQuery event, this => button
     */
    cancelTradeAction: function(e) {
      var me = e.data.me,
        model = me.model,
        tradeAccount = model.get('tradeAccount'),
        actionsEl = tradeAccount.getContentEl(),
        tradeActions = model.get('activeTradeActions'),
        target = e.target;

      do {
        var targetId = target.id,
          done = target.tagName == 'A';

        target = target.parentElement;
        if (!done) {
          done = !target;
        }
      } while (!done);

      if (targetId) {
        var tradeAction = tradeActions.get(targetId),
          actionEl = tradeAction.get('el');

        actionsEl.removeChild(actionEl);
        tradeActions.remove(tradeAction);
      }
    },


    /**
     * Using template actionui.html constructs the markup for new Trade Action and append it to #gox form.
     * Reference to created DOM element is stored to TradeAction model
     *
     * @param tradeAction {TradeAction} model
     * @param stockTicker
     * @param stockExchange
     */
    createTradeAction: function(tradeAction, stockExchange, stockTicker) {
      var $G = $.Goxnode();
      var model = this.model, //StartupModel
        tradeAccount = model.get('tradeAccount'),
        tradeActions = model.get('activeTradeActions');

      tradeActions.add(tradeAction);

      var actionsEl = tradeAccount.getContentEl(),
        actionUI = this.actionTemplate({
          tradeAction: tradeAction,
          stockExchange: stockExchange,
          stockTicker: stockTicker
        });


      // jqm enhancement
      $(actionsEl).append(actionUI).trigger('create');

      // trick to get new created DOM element
      var actionEl = actionsEl.lastElementChild;

      // let save it to model
      tradeAction.set({
        el: actionEl
      });

      var cancelEl = $('a', actionEl);
      var tapEvent = $G.tapEvent;
      $(cancelEl).on(tapEvent, {me: this}, this.cancelTradeAction);

      return actionEl;
    },


    findOrderId: function (e) {
      var target = e.target,
        orderId;

      do {
        var done = $(target).hasClass('trade-order');

        orderId = target.id;

        target = target.parentElement;
        if (!done) {
          done = !target;
        }
      } while (!done);

      return orderId;
    },


    cancelBidder: function (bidderModel) {
      var socket = $G.socket;

      var ontopId = bidderModel.get('ontopId'),
        orderId = bidderModel.id;

      socket.emit('stopBidder', {
        bidderId: orderId,
        orderId: ontopId
      });
    },

    cancelOrder: function(e) {
      var $G = $.Goxnode(),
        socket = $G.socket;

      var me = e.data.me,
        orderId = me.findOrderId(e),
        startupModel = me.model,
        orders = startupModel.get('orders'),
        orderModel = orders.get(orderId),
        status = orderModel ? orderModel.get('status') : 'new',
        editing = status == 'editing',
        hold = orderModel.get('hold'),
        ontop = orderModel.get('ontop'),
        doCancel = false,
        event = window.event,
        meta = event.metaKey,
        ctrl = event.ctrlKey,
        alt = event.altKey,
        shift = event.shiftKey,
        onlyTyped = alt || meta,
        removedType = orderModel.get('type'),
        allOrders = ctrl || shift,
        massRemove = onlyTyped || allOrders,
        toRemove = [],
        bidderRemove = [];


      // Mass remove
      if (massRemove) {
        console.log('MASS REMOVE ORDER : ' + (onlyTyped ? ('BY TYPE -  ' + removedType.toUpperCase())  : 'ALL ORDERS'));
        var oid, bidderId;
        orders.each(function (order) {
          var type = order.get('type'),
            ontopId = order.get('ontopId');

          oid = order.id;
          bidderId = null;

          if (order instanceof BidderModel || ontopId != null) {
            bidderId = oid;
            oid = null;
          }
          if (onlyTyped) {
            if (type != removedType) {
              oid = null;
              bidderId = null;
            }
          }
          if (oid) {
            console.log('... removing ', oid);
            toRemove.push(oid);
          }
          if (bidderId) {
            bidderRemove.push(order);
          }
        });

        socket.emit('massOrderCancel', toRemove);

        _.each(bidderRemove, function(bidder) {
          me.cancelBidder(bidder);
        });
        return;
      }

      if (!editing) {
        if (status == 'new' || hold) {
          orders.removeOrderUI(orderModel);
          if (hold) {
            $G.dropOrderPersistence(orderModel.id);
          }
        } if (ontop) {
          me.cancelBidder(orderModel);
        } else {
          doCancel = true;
        }

        if (doCancel) {
          socket.emit('cancelOrder', orderId);
        }
      } else {
        // revert changes to before edit
        orderModel.set('status', 'revert');
      }
    },


    confirmOrder: function(e) {
      var me = e.data.me,
        $G = $.Goxnode(),
        socket = $G.socket,

        startupModel = me.model,
        orders = startupModel.get('orders'),
        ticker = startupModel.get('stockTicker'),
        bid = ticker.get('bid'),
        ask = ticker.get('ask'),
        orderId = me.findOrderId(e),
        orderModel = orders.get(orderId),
        orderType = orderModel.get('type'),
//        orderPrice = orderModel.get('price').get('value'),
        orderPriceInt = orderModel.get('price').get('value_int'),
        orderAmountInt = orderModel.get('amount').get('value_int');

//
//        isBid = orderType == 'bid',
//        absoluteEdge = !isBid ? 0 : Number.MAX_VALUE,
//        warningEdge = isBid ? ask : bid


/*
      orders.each(function(order) {
        var type = order.get('type');

        if (type != orderType) {
          var price = order.get('price').get('value_int');

          if ((isBid && price < absoluteEdge) || (!isBid && price > absoluteEdge)) {
            absoluteEdge = price;
          }
        }
      });

      var warning, noGo = false,
        warningType, warningSeverity = 0;

      if ((isBid && warningEdge > absoluteEdge) || (!isBid && warningEdge < absoluteEdge)) {
        warningSeverity = 3;
      } else if ((isBid && orderPrice > absoluteEdge) || (!isBid && orderPrice < absoluteEdge)) {
        warning = 'First remove Orders';
        warningSeverity = 2;
      } else if ((isBid && orderPrice > warningEdge) || (!isBid && orderPrice < warningEdge)) {
        warning = (isBid ? 'BUY' : 'SELL') + ' RIGHT NOW?';
        warningSeverity = 1;
      }

      if (warningSeverity) {
//        var dialog = $('#dialogPage');
//        $.mobile.changePage( "#dialogPage", { role: "dialog" } );
      }
*/


      var continueCheck = true;

      if (orderId) {
        var originalValues = orderModel.original,
          hold = orderModel.get('hold'),
          prevHold = originalValues.hold,
          ontop = orderModel.get('ontop'),
          prevOntop = originalValues.ontop,
          phantom = orderModel.get('phantom');

        if (continueCheck && (ontop != prevOntop)) {
          if (ontop && !prevOntop) {
            continueCheck = false;
            submitBidder(hold);
            orderModel.set('status', 'ontop');
          } else if (!ontop && prevOntop) {
            continueCheck = false;
            me.cancelBidder(orderModel);
          }
          originalValues.ontop = ontop;
        }

        if (continueCheck && (hold != prevHold)) {
          if (!ontop) {
            if ((hold && !prevHold) && !phantom) {
              socket.emit('cancelOrder', orderId);
              orderModel.set('status', 'hold');
              continueCheck = false;
            } else if (!hold && prevHold) {
              submitOrder(true);
              $G.dropOrderPersistence(orderModel);
              continueCheck = false;
            }
          } else {

            continueCheck = false;
            socket.emit('holdBidder', {
              bidderId: orderId,
              hold: hold
            });
          }
          originalValues.hold = hold;
          orderModel.tweakUIByHold();
        }

        if (continueCheck) {
          submitOrder();
        }

        $G.persistOrderSettings(orderModel, {
          collapsed: false
        });
      }


      function preparePayload(dropOrder) {
        if (dropOrder === undefined) {
          dropOrder = orderModel.get('phantom');
        }
        return {
          oid: orderId,
          type: orderType,
          price_int: orderPriceInt,
          phantom: dropOrder,
          amount_int: orderAmountInt
        };
      }

      function submitOrder(dropOrder) {
        var createOptions = preparePayload(dropOrder);

        console.log('about to create ORDER with params', createOptions);
        socket.emit('createOrder', createOptions);
      }

      function submitBidder(hold) {
        var createOptions = preparePayload();

        delete createOptions.price_int;
        createOptions.hold = hold;

        console.log('about to create BIDDER with params', createOptions);
        socket.emit('createBidder', createOptions);
      }
    },


    createOrder: function(model, insertedEl) {
      var $G = $.Goxnode();
      var startupModel = this.model,
        tradeAccount = startupModel.get('tradeAccount'),
        stockExchange = startupModel.get('stockExchange'),
        stockTicker = startupModel.get('stockTicker'),
        orderBase = model.get('item'),
        orderCur = model.get('currency'),
        oldOid = model.get('oldOid'),
        base = stockExchange.getBaseCurrency(),
        cur = stockExchange.getCurCurrency(),
        orders = startupModel.get('orders'),
        el = orders.getContentEl();

      if (!el || (!(orderBase == base && orderCur == cur)) && _.isEmpty(oldOid)) {
        return;
      }

      orderUI = this.orderTemplate({
        model: model,
        stockTicker: stockTicker,
        stockExchange: stockExchange,
        tradeAccount: tradeAccount
      });

      var ct = $(el).append(orderUI).trigger('create');

      // trick to get new created DOM element
      // let save it to model
      var orderEl = model.el = el.lastElementChild,
        $order = $(orderEl),
        checkboxes = $order.find('input[type=checkbox]');

      _.each(checkboxes, function(checkbox) {
        var $checkbox = $(checkbox),
          checkboxName = $checkbox.attr('name'),
          field = checkboxName.toLowerCase(),
          value = model.get(field);

        model.setCheckboxValue(value, $checkbox);

        $checkbox.on("click", function(e) {
          var newValue = $checkbox.prop('checked');

          model.set(field, newValue);
          model.set('status', 'editing');
        });

      });

      var tapEvent = $G.tapEvent;

      var cancelEl = model.cancelButtonEl();
      $(cancelEl).on(tapEvent, {me: this}, this.cancelOrder);

      var confirmEl = model.confirmButtonEl();
      $(confirmEl).on(tapEvent, {me: this}, this.confirmOrder);

      function findSlider(sliderName) {
        var ret = null;
        _.some(allSliders, function(sliderInfo, name) {
          if (name == sliderName) {
            ret = sliderInfo.el;
            return true;
          }
          return false;
        });
        return ret;
      }

      function calculateChangeOptions($slider, sliderName) {
        var valueModel, currency,
          changeProperty, value, valueAttributes,
          changeOptions = {};

        var sliderValue = $slider.val(),
          sliderValueNumber = parseFloat(sliderValue),
          valueOptions = {
            ui: true
          };

        if (sliderName == 'amount') {
          value = sliderValue;
          changeProperty = 'amount';

          valueAttributes = {
            value: value
          };

          valueModel = new AmountModel(valueAttributes,valueOptions);
        } else {
          var priceModel = model.get('price');
          var millisInfo = findSlider('millis'),
            startMillis = millisInfo.start,
            lower = startMillis < 0,
            parsedPrice = priceModel.toParsedPrice({
              lower: lower
            });

          changeProperty = 'price';
          currency = stockExchange.getCurCurrency();
          var slidersToUpdate = [];

          if (sliderName == 'millis') {
            value = checkMillisBounds($slider);
          } else if (sliderName == 'cents') {
            value = checkCentsBounds($slider);
          } else {
            value = checkDigitsBounds($slider, sliderValueNumber);
          }

          slidersToUpdate.push($slider);
          _.each(slidersToUpdate, function(slider) {
            slider.slider('refresh');
          });

          value = 0.0;
          _.each(allSliders, function(info, sliderName) {
            var slider = $(info.el);

            if (info.isPrice) {
              value += parseFloat(slider.val());
            }
          });

          valueAttributes = {
            value: value,
            currency: currency
          };

          valueModel = new PriceModel(valueAttributes, valueOptions);
        }

        changeOptions[changeProperty] = valueModel;

        return changeOptions;



        function checkMillisBounds(slider) {
          const boundValue = -0.0005;
          var ret = sliderValueNumber,
            absValue = Math.abs(ret),
            direction = absValue == ret ? 1 : -1;

          if (sliderValueNumber < 0) {
            parsedPrice = priceModel.toParsedPrice({
              lower: true
            })
          }

          if (absValue == 0.0005) {
            var centsSlider = findSlider('cents'),
              cents = parseFloat(centsSlider.val()) + direction * 0.001;

            ret = direction * boundValue;
            parsedPrice.cents = cents;
            slider.val(ret);
            centsSlider.val(cents);
            checkCentsBounds(centsSlider, cents);

            slidersToUpdate.push(centsSlider);
          }
          return ret;
        }

        function checkCentsBounds(slider, value) {
          const incrementValue = 0.1,
            step = 0.001;

          if (value == null) {
            value = sliderValueNumber;
          }

          if (value == incrementValue || value < 0) {
            var direction = value < 0 ? -1 : 1,
              digitsSlider = findSlider('digits'),
              digitsChange = direction * incrementValue,
              digits = parsedPrice.digits + digitsChange;

            value = direction == 1 ? 0 : incrementValue - step;

            parsedPrice.digits = digits;
            parsedPrice.cents = value;

            slider.val(value);
            digitsSlider.val(digits);
            checkDigitsBounds(digitsSlider, digits);

            slidersToUpdate.push(digitsSlider);
          }
          return value;
        }

        function checkDigitsBounds(slider, checkValue) {
          var range = {
              max: parseFloat(slider.attr('max')),
              min: parseFloat(slider.attr('min'))
            },
            direction = 0;

          _.some(range, function (value, side) {
            if (value == checkValue) {
              direction = side == 'max' ? 1 : -1;
              return true;
            }
            return false;
          });

          if (direction) {
            var step = (range.max - range.min) / 2;

            _.each(range, function (value, side) {
              slider.attr(side, range[side] + step * direction);
            });
          }
          return checkValue;
        }
      }

      var allSliders = {};
      _.each(['digits', 'cents', 'amount', 'millis'], function(sliderName) {

        var sliderEl = $order.find('input.' + sliderName),
          $slider = $(sliderEl),
          initialValue = $slider.val();

        allSliders[sliderName] = {
          el: sliderEl,
          value: initialValue,
          isPrice: sliderName != 'amount',
          attr: {
            max: $slider.attr('max'),
            min: $slider.attr('min'),
            step: $slider.attr('step')
          }
        };

        $slider.slider({
          beforestart: function(jqEvent) {
            var value = $slider.val(),
              sliderInfo = findSlider(sliderName);

            if (sliderInfo) {
              sliderInfo.start = value;
//              console.log('Save start value', value);
            }
          },
          stop: function(jqEvent) {

            var stop = $slider.val(),
              sliderInfo = findSlider(sliderName),
              start = sliderInfo.start;

            if (start != stop) {
              var changeOptions = calculateChangeOptions($slider, sliderName);

              // should call separate, otherwise wrong original values
              model.set('status', 'editing');
              model.set(changeOptions);
            }
          }
        })
      });

      model.allSliders = allSliders;

    },


    /**
     * tb removed?
     */
    addThread: function() {
      console.log('new thread about to add...');
      alert('addThread');
    },


    /**
     * tb removed?
     */
    showNew: function() {
      console.log('show new threads...');
    },

    /**
     * Main page rendering. Use predefined template 'startup.html'
     *
     * @returns {*}
     */
    render: function() {
      var me = this,
        $el = me.$el,
        model = me.model;

      var tradeAccount = model.get('tradeAccount'),
        strategies = tradeAccount.get('strategies'),
        stockExchange = model.get('stockExchange'),
        stockTicker = model.get('stockTicker'),
        orders = model.get('orders');


      $el.html(this.template({
        strategies: strategies,
        tradeAccount: tradeAccount,
        stockExchange: stockExchange,
        stockTicker: stockTicker
      }));

      var goxnode = this.el.lastElementChild;

      model.set({
        el: goxnode
      });

      $el.on('pageinit', function() {
        var collapsibleEl = $(goxnode).find('[data-role=collapsible-set]'),
//          collapsibleList = collapsibleEl.children(),
          strategiesEl = $(collapsibleEl).find('.strategies'),
          ordersEl = $(collapsibleEl).find('.orders');

        tradeAccount.set({el: strategiesEl});
        orders.el = ordersEl;
        orders.owner = me;
      });

      return this;
    }
  });

});
