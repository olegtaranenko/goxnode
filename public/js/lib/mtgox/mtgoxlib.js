/*
 * Created by JetBrains WebStorm.
 * User: user1
 * Date: 20.04.13
 * Time: 19:13
 */

/**
 *
 */

/*
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
}(function ($) {
}));
*/

(function(root, factory) {
  // Set up MtgoxLib appropriately for the environment.
  if (typeof exports !== 'undefined') {
    // Node/CommonJS, no need for jQuery in that case.
    factory(root, exports, require('underscore'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], function(exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global MtgoxLib.
      root.MtgoxLib = factory(root, exports);
    });
  } else {
    // Browser globals
    root.MtgoxLib = factory(root, {});
  }
}(this,

function(root, MtgoxLib) {

  MtgoxLib.constructor = function(config) {
    this.apiKey = config.apiKey;
    this.secret = config.secret;
    return this;
  };

  /**
   * Query via https
   *
   *
   * @param options
   */
  MtgoxLib.queryHttps = function(options) {

    const MTGOX_HTTPS_URL = 'https://data.mtgox.com/api';
    const MTGOX_API_VERSION = '1',
      port = 443;

    var payload = options.payload || {},
      cb = options.cb,
      version = options.version || MTGOX_API_VERSION,
      command = options.command,
      path;

//    Log.debug('queryHttps() options ->', options);
    function getCommandPath(command, version) {
      const commands = {
        '1': {
          "ticker": "{PAIR}/ticker",
          "info": "generic/private/info",
          "orders": "generic/private/orders",
          "idkey": "generic/private/idkey"
        },
        '2': {
          "ticker": '{PAIR}/money/ticker',
          "privateInfo": "money/info",
          "ordersPath": "money/orders",
          "idkey": "money/idkey"
        }
      };

      var ret = commands[version][command];
      if (ret) {
        return ret;
      }
      Log.error('check code, wrong command/version', command, version);
      return null;
    }

    if (command) {
      path = getCommandPath(command, version);
    } else {
      path = options.path;
    }

    if (!path) {
      const err = 'wrong Https call, path is undefined';
//      Log.error (err);
      throw new Error(err);
    }

    payload.nonce = Nonce();
    var post = qs.stringify(payload);

    var hmac = crypto.createHmac('sha512', new Buffer(secret, 'base64'));
    hmac.update(post);
    var restSign = hmac.digest('base64');

    Log.debug('restSign => ', restSign, 'apiKey => ', apiKey);
    var url = MTGOX_HTTPS_URL + '/' + version+ '/' + path;
    if (version == '2') {
      url += '\0';
    }
    var r = {
      url: url,
      json: true,
      method: 'POST',
      body: post,
      headers: {
        'Rest-Key': apiKey,
        'Rest-Sign': restSign,
        'User-Agent': 'Mozilla/4.0 (compatible; MtGox node.js client)',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    };

    Log.debug('about to execute AJAX to', r.url, ', params ->', payload);

    request(r, function(err, res, body) {
//      Log.debug('body => ', body);
      if (err) {
        return cb(err);
      }
      if (!body) {
        return cb(new Error('failed to parse body'));
      }
      if (body.error) {
        return cb(new Error(body.error));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return cb(new Error('status code ' + res.statusCode));
      }

      var ret;
      if (MTGOX_API_VERSION == '1') {
        ret = body.return;
      } else if (MTGOX_API_VERSION == '2') {
        ret = body.data;
      }
      return cb(null, ret);
    });
  };

  return MtgoxLib;
}));
