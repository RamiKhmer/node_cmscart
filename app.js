const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const fileUpLoad = require('express-fileupload');

const config = require("./config/database");

// connect to db
mongoose.connect(config.database, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify:false
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to mongodb");
});


// Init App
const app = express();

// View engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// set global variable
app.locals.errors = null;

// Express fileUpLoad middleware
app.use(fileUpLoad());

// Set Body Parser middle Ware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: {secure: true}
}));

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length){
      formParam+= '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg:msg,
      value: value
    };
  },
  customValidators: {
    isImage: function(value, filename){
      let extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg': return '.jpg';
        case '.jpeg': return '.jpeg';
        case '.png': return '.png';
        case '': return '.jpg';
        default: return false;
      }
    }
  }
}));

// Express Messages Middle Ware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Set the Routs
const pages = require("./routes/pages");
const adminPages = require("./routes/admin_pages");
const adminCategories = require("./routes/admin_categories");
const adminProducts = require("./routes/admin_products");

app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/", pages);

// Start the server

const port = 3000;
app.listen(port, ()=> {
    console.log(`the server start on port ${port} at ${new Date()}`);
})