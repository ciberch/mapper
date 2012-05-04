var prompt = require("./prompt")
  , fs = require('fs')
  , async = require("async")
  , db = require("mysql-libmysqlclient");

var create = {
  bench:
    "CREATE TABLE users( \
       id int not null auto_increment primary key, \
       userName varchar(255), \
       firstName varchar(255), \
       lastName varchar(255), \
       createdAt timestamp default current_timestamp \
     )",

  posts:
    "CREATE TABLE posts (\
      id integer NOT NULL,\
      title character varying(255) NOT NULL,\
      blurb character varying(255),\
      body text NOT NULL,\
      published boolean,\
      created_at date,\
      updated_at date,\
      CONSTRAINT posts_pkey PRIMARY KEY (id))",

  comments:
    "CREATE TABLE comments (\
      id integer NOT NULL,\
      post_id integer NOT NULL,\
      comment text NOT NULL,\
      created_at date,\
      CONSTRAINT comments_pkey PRIMARY KEY (id))",

  comments_post_id_index:
    "CREATE INDEX comments_post_id \
      ON comments(post_id)"
};

console.log("\nMapper. Please enter your MySQL credentials " +
            "and a database for us to create.\n");

async.series({
  "user": function(cb) {
    prompt("username: ", cb);
  },
  "password": function(cb) {
    prompt("password: ", null, true, cb);
  },
  "database": function(cb) {
    prompt("database: ", "mapper_test", cb);
  },
  "host": function(cb) {
    prompt("host: ", "localhost", cb);
  },
  "port": function(cb) {
    prompt("port: ", 3306, cb);
  },
}, function(err, config) {
  config.password = config.password === null ? '' : config.password;

  console.log(config);

  var client = db.createConnectionSync(config.host, config.user, config.password);
  client.querySync("DROP DATABASE IF EXISTS "+config.database);
  client.querySync("CREATE DATABASE "+config.database);
  client.querySync("GRANT ALL PRIVILEGES ON "+config.database+".* TO '"+config.user+"'@'"+config.host+"';");
  client.closeSync();
  client = db.createConnectionSync(config.host, config.user, config.password, config.database);
  async.series([
    function(cb) { client.query(create.bench, cb); },
    function(cb) { client.query(create.posts, cb); },
    function(cb) { client.query(create.comments, cb); },
    function(cb) { client.query(create.comments_post_id_index, cb); }
  ], function(err, results) {
    if (err) console.error(err);
    if (!err) {
      fs.writeFile('.mapper.json', JSON.stringify(config), function (err) {
        client.closeSync();
        process.exit();
      });
    };
  });
});
