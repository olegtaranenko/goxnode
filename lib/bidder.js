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

var debugCount = 0;

var Bidder = function(driver, options) {
  var me = this,
    hold = options.hold;

  me._hold = !!hold;
  options.bidderId = options.oid;

  me.oneOff = true;

  _.extend(me, options);

  console.log(me);

  function doPop(cb, targetPrice) {
    var args = arguments,
      priceInt = me.price_int,
      type = me.type;

    targetPrice = parseInt(targetPrice);

    if (me.hold() && !me.oneOff) {
      return;
    }
    if (targetPrice == priceInt) {
      return;
    }
    var random = Math.round(Math.ceil(Math.random() * 10) / 10) + priceStepInt;

//    random = -200000;

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
    Log.info('CANCELLING ORDER in BIDDER -> ', me.type, cancellingOid);
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

    Log.info('CREATE ORDER in BIDDER -> ', me.type, me.price_int, me.amount_int);
    me.processing = true;
    var callback = function(err, data) {
      Log.debug(' <- created ', data);
      me.processing = false;
      me.oid = data;
      delete me.cancellingOid;
      delete me.oneOff;

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

  me.hold = function() {
    var hold = arguments[0];

    if (hold === undefined) {
      return me._hold;
    }

    me._hold = hold;
    return null;
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
