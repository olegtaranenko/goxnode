var path = require("path");
var fs = require("fs");
var db_dir = path.join(__dirname, 'db'),
  db_name = process.argv[2] || 'goxnode.db',
  db_file = path.join(db_dir, db_name);

var sqlite3 = require('sqlite3').verbose();
sqlite3.verbose();

fs.unlink(db_file, function() {


  var db = new sqlite3.Database(db_file, function() {
    console.log('db created, ', db_file);
    db.run("CREATE TABLE config (key TEXT, val TEXT, dtVal DATETIME, intVal INTEGER)", function() {
      db.run("CREATE TABLE depth (price INTEGER PRIMARY KEY, size INTEGER)", function() {
        db.run ("insert into depth(price, size) values (10, 5)", function() {
          db.run ("insert into depth(price, size) values (11, 1)", function(){
            submitTrade(11, -2);
            submitTrade(9, 20);
            submitTrade(10, 5);
            submitTrade(10, -1);
            submitTrade(10, 100);
            submitTrade(10, 1000);
          });
        });
      });
    });



    db.close();
  });

//  var s = db.prepare('select size from depth where price = (?)', function() {
//    console.log('statement prepared');
//  });

  function submitTrade(price, size, cb) {
    var loop = 'select size from depth where price = (?)';

    var doUpdate = false, doDelete = false;
    var updatedSize = size;
    db.each(loop, price,
      function (err, result) {
//        console.log('Callback args => ', arguments);
        //callback
        var currentSize = result.size;
        updatedSize = size + currentSize;
        if (updatedSize <= 0) {
          doDelete = true;
        } else {
          doUpdate = true;
        }
//        console.log('updatedSize => ', updatedSize);
      },
      function (err, rows) {
        if (err) {
          console.log('Error in prepare', err);
          s.reset();
          return;
        }
//        console.log('Complete args => ', rows, doUpdate, doDelete);
//        console.log('updatedSize => ', updatedSize);
        //complete
        if (doUpdate) {
          db.run('update depth set size = (?) where price = (?)', updatedSize, price)
        } else if (doDelete) {
          db.run('delete from depth where price = (?)', price);
        } else {
          db.run('insert into depth(size, price) values (?, ?)', updatedSize, price);
        }
      }
    );
  }


/*
  db.serialize(function() {
    db.run("CREATE TABLE config (key TEXT, val TEXT, dtVal DATETIME, intVal INTEGER)");

    db.run("CREATE TABLE depth (price INTEGER PRIMARY KEY, size INTEGER)");

    db.run ("insert into depth(price, size) values (10, 5)");
    db.run ("insert into depth(price, size) values (11, 1)");

//    submitTrade(10, 1);
//    submitTrade(10, 2);
//    submitTrade(9, 0.5);

//  db.run("CREATE UNIQUE INDEX D_PRICE ON depth (price)");


//    db.run("CREATE TRIGGER DEPTH_UPDATE_U AFTER UPDATE ON depth FOR EACH ROW " +
//      " WHEN OLD.PRICE IS NOT NULL" +
//      " BEGIN" +
//      " NEW.SIZE = NEW.SIZE + OLD.SIZE" +
//      " END");

//     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//     for (var i = 0; i < 10; i++) {
//     stmt.run("Ipsum " + i);
//     }
//     stmt.finalize();
//
//     db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//     console.log(row.id + ": " + row.info);
//     });
  });

*/
});

