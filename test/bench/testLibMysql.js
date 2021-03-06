var async = require("async")
  , config = require("../../.mapper.json");


function testLibMysql(cb) {
  var mysql = require('mysql-libmysqlclient')
    , client = mysql.createConnectionSync(config.host, config.user, config.password, config.database);

  var iteration = 0;
  async.whilst(
    function() { return iteration < 100000; },

    function (cb) {
      iteration++;
      if (iteration % 2 === 0) {
        client.query("insert into users(userName, firstName, lastName) values('libmysql', 'is', 'fast')", function(err, result) {
          //if (iteration === 2) console.log(result);
          cb(err);
        });
      } else {
        client.query("select userName, firstName, lastName from users limit 25;", function(err, result) {
          result.fetchAll(function(err, rows) {
            //if (iteration === 3) console.log(rows);
            cb(err);
          });
        });
      }
    },

    function(err) {
      if (err) console.error(err);
      cb(err);
    }
  );
}


testLibMysql(function(err) {
  process.exit();
});
