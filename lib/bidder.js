/*
 * Created by JetBrains WebStorm.
 * User: user1
 * Date: 05.05.13
 * Time: 15:39
 */

var util = require('util');
var events = require('events'),
  _ = require('underscore');

var mylogger = require('./mylogger'),
  Log = new mylogger();

const priceStepInt = 3;

var Bidder = function(driver, options) {
  var me = this;
  options.bidderId = options.oid;

  me.initialConfig = options;

  _.extend(me, options);

  console.log(me);

  function doPop(cb, targetPrice) {
    var args = arguments,
      priceInt = me.price_int,
      type = me.type;

    targetPrice = parseInt(targetPrice);

    if (targetPrice == priceInt) {
      return;
    }
    var random = Math.round(Math.ceil(Math.random() * 10) / 10) + priceStepInt;

    if (random > 13) {
      Log.debug('error in random calculation', random);
      return;
    }

    me.price_int = targetPrice + random * (type == 'ask' ? -1 : 1);
    if (!_.isEmpty(me.oid)) {
      cancelOrder(function(err, data) {
        createOrder.apply(me, args);
      });
    } else {
      createOrder.apply(me, args);
    }
  }

  function cancelOrder(cb) {
    var args = arguments,
      cancellingOid = me.oid;
    
    var callback = function(err, data) {
//      me.processing = false;
      delete me.oid;
      cb.apply(me, arguments);
    };


    me.processing = true;
    me.cancellingOid = cancellingOid;
    driver.queryHttps({
      command: "cancel",
      payload: {
        oid: cancellingOid
      },
      cb: callback
    })
  }

  function createOrder(cb) {
    var args = arguments;
    var payload = {
      type: me.type,
      price_int: me.price_int,
      amount_int: me.amount_int
    };

    Log.info('CREATE ORDER in BIDDER -> ', payload);
    me.processing = true;
    var callback = function(err, data) {
      me.processing = false;
      me.oid = data;
      delete me.cancellingOid;

      cb.apply(me, arguments);
    };

    driver.queryHttps({
      command: 'add',
      payload: payload,
      cb: callback
    });
  }

  me.suspend = function() {

  };

  me.inactive = function() {
    var value = arguments[0];
    if (value !== undefined) {
      me._inactive = value;
    } else {
      return !!me._inactive;
    }
    return me;
  };

  me.isProcessing = function() {
    return !!me.processing;
  };

  me.getCurrentOid = function(){
    return me.oid;
  };

  me.getBidderId = function(){
    return me.bidderId;
  };

  me.stop = function(cb) {
    me.inactive(true);
    me.cleanupCallback = cb;
  };

  me.cleanup = function() {
    cancelOrder(function(err) {
      Log.debug('BIDDER STOPPED!');

      var callback = me.cleanupCallback;
      if (callback) {
        callback.apply(me, arguments);
      }
    })
  };

  me.process = function(buy, sell) {
    if (me.isProcessing()) {
      return;
    }

    if (buy && buy.buy) {
      // ticker
      sell = buy.sell;
      buy = buy.buy;
    }

    var bidderType = me.type,
      targetPrice = bidderType == 'ask' ? sell : buy;


    if (targetPrice.value_int ) {
      targetPrice = targetPrice.value_int;
    }

    doPop(function() {}, targetPrice);
  }
};

util.inherits(Bidder, events.EventEmitter);

module.exports = Bidder;
