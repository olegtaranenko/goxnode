var path = require("path");
var fs = require("fs");
var db_dir = path.join(__dirname, 'db'),
  db_name = process.argv[2] || 'goxnode.db',
  db_file = path.join(db_dir, db_name);

var sqlite3 = require('sqlite3').verbose();
//sqlite3.verbose();

  var db = new sqlite3.Database(db_file, sqlite3.OPEN_READONLY, function() {

    db.each('select * from depth where price > 0',
      function(err, row) {
        console.log('Row ->', row)
      }, function(err, rowNumber) {
        console.log('rowNumber ->', rowNumber);
      }
    );
    db.close();
  });






