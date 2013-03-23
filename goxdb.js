var path = require("path");
var fs = require("fs");
var db_dir = path.join(__dirname, 'db'),
  db_name = process.argv[2] || 'goxnode.db',
  db_file = path.join(db_dir, db_name);

var mylogger = require('./lib/mylogger'),
  Log = new mylogger();

var fullDepthFile = __dirname + '/api/v0/depth/fulldepth.json';
var sqlite3 = require('sqlite3').verbose();


var depthMemoryDb = exports.depthMemoryDb = function(options) {
  var fullDepth = options.fullDepth,
    cb = options.cb,
    ticker = options.ticker,
    end0, end1, end2, start;

  var db = new sqlite3.Database(':memory:', function() {
//  var db = new sqlite3.Database(db_file, function() {

    db.run("CREATE TABLE depth (price INTEGER PRIMARY KEY, size INTEGER, tp INTEGER)", function() {
      try {
        var ret = fullDepth.return,
          asks = ret.asks,
          bids = ret.bids;

        var stmt = db.prepare("insert into depth(price, size, tp) values (?, ?, ?)");
        var len = bids.length;

        start = new Date();
        for (var i = 0; i < len; i++) {
          var depth = bids[i],
            price = depth.price_int,
            amount = depth.amount_int;

          stmt.run(price, amount, 0);
        }

        end0 = new Date();

        len = asks.length;
        for (i = 0; i < len; i++) {
          depth = asks[i];
          price = depth.price_int;
          amount = depth.amount_int;

          stmt.run(price, amount, 1);
        }
        end1 = new Date();
        var self = this;
        var finalizeCb = function() {
          end2 = new Date();
          console.log('created depth for bids: %d s, asks: %d s, total: %d s',  (end0 - start) / 1000, (end1 - end0) / 1000, (end2 - start) / 1000 );
          if (cb) {
            cb.apply(self, arguments);
          }
        };
        stmt.finalize(finalizeCb);

      } catch(ex) {
        console.log('error', ex);
      }
    });

    return db;
//    db.close();
  });

};

/*
fs.unlink(db_file, function() {

  var fullDepth = JSON.parse(fs.readFileSync(fullDepthFile));

 depthMemoryDb(fullDepth, function() {
    end2 = new Date();
    console.log('created depth for bids: %d s, asks: %d s, total: %d s',  (end0 - start) / 1000, (end1 - end0) / 1000, (end2 - start) / 1000 );
  });

});
*/
