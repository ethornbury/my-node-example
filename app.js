// Standard set up for the express code to work with your code
var express     = require('express');
var app         = express();
const path      = require('path');
const VIEWS     = path.join(__dirname, 'views');
var bodyParser  = require("body-parser");
var jade        = require('jade');
var fs          = require('fs');         //file system, to access files like text, json, xml
app.set('view engine', 'jade');

//var datetime = require('node.date-time');    //to get a current time stamp but did it the other way
console.log('current: ' + new Date(Date.now()).toLocaleString());    //testing by sending current timestamp to console
var wstream = fs.createWriteStream('logger.txt');    //create a log of activity with current timestamp in a file called logger.txt
wstream.write('Log file\n');
//wstream.end();

var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({ secret: "topsecret" })); // Requird to make the session accessable throughouty the application


app.use(express.static("scripts"));  // allow the application to access the scripts folder contents to use in the application
app.use(express.static("images"));   // allow the application to access the images folder contents to use in the application
app.use(express.static("views"));    // Allow access to content of views folder
app.use(express.static("models"));   // Allow access to content of models folder where JSON is
app.use(express.static("views/user"));

app.use(bodyParser.urlencoded({extended:true})); //place in general that which uses it

//my gearhost MYSQL db credentials to create a connection
var mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'den1.mysql4.gear.host',
  user     : 'emernode',
  password : 'Jt55Wlv-2a2-',
  database : 'emernode'
});

//Using the db above to connect to gearhost db
db.connect((err) => {
  if(err){
    //throw err;
    console.log("db connect broke", err);
    wstream.write('error connecting to gearhost db');
  }else{
    console.log("Connected to gearhost DB...");
    wstream.write('\nConnected to gearhost DB...' + new Date(Date.now()).toLocaleString());
    //console.log(new Date().format("d-M-Y"));  date stamp
  }
});


// SQL create product table Example
app.get('/create-products-table', function(req, res) {
  //let sql = 'DROP TABLE products;'
  let sql = 'CREATE TABLE products ( Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Price int, Image varchar(255), Activity varchar(255));';
    let query = db.query(sql, (err, res) => {
      if(err) throw err;
       console.log(res);
      });
    wstream.write('\nproduct table created on the db');
    res.send("Well done products table created...");
});


//--------------PRODUCT CRUD
//taking data from a form in the views - post request
app.post('/new-product', function(req, res) {
  let sql = 'INSERT INTO products ( Name, Price, Image, Activity) VALUES ("'+req.body.name+'", "'+req.body.price+'", "'+req.body.image+'", "'+req.body.activity+'")';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    wstream.write('\nnew product added ' + req.body.name + " " + new Date(Date.now()).toLocaleString());
  });
  //res.send("Well done, new product created...");
  res.redirect('/products'); // redirect to product funtion 
  console.log("Now you are on the products page!");
});

app.get('/products', function(req, res){
 let sql = 'SELECT * FROM products';
 let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    res.render('products.jade', {root: VIEWS, res1});
    //res.send(res1); //showa table contents but needs style
    console.log(res1);
     wstream.write('\nall product listing ' + new Date(Date.now()).toLocaleString());
  });
  //console.log("Now you are on the products page! Session set as seen on products page " + req.session.email);
  console.log("Now you are on the products page! ");
});


// function to render the individual products page
app.get('/item/:id', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
 let sql = 'SELECT * FROM products WHERE Id = "'+req.params.id+'";';
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  res.render('item.jade', {root: VIEWS, res1}); // use the render command so that the response object renders a HHTML page
  wstream.write('\nproduct listed ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
 });
 console.log("Now you are on the Individual product page!");
});

//edit a product
app.get('/edit-product/:id', function(req, res){
 let sql = 'SELECT * FROM products WHERE Id = "'+req.params.id+'";';
 console.log(req.params.id);
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nproduct edit page ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.render('edit-product', {root: VIEWS, res1});// use the render command so that the response object renders a HHTML page
 });
 console.log("Now you are on the edit product page!");
});

//take the data from the form to the database
app.post('/edit-product/:id', function(req, res){
    let sql = 'UPDATE products SET Name = "'+req.body.newname+'", Price = "'+req.body.newprice+'", Activity = "'+req.body.newactivity+'", Image = "'+req.body.newimage+'" WHERE Id = "'+req.params.id+'";';
        let query = db.query(sql, (err, res) =>{
             if(err) throw err;
             console.log(res);
        });
        wstream.write('\nproduct edited ' + req.body.newname + ' ' + new Date(Date.now()).toLocaleString());
    res.redirect("/item/" + req.params.id);
});


// function to delete product data based on button press and form
app.get('/delete/:id', function(req, res){
 let sql = 'DELETE FROM products WHERE Id = "'+req.params.id+'";';
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nproduct deleted ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.redirect('/products'); // use the render command so that the response object renders a HHTML page
 });
 console.log("Its Gone!");
});

// Search products table function 
app.post('/search', function(req, res){
 let sql = 'SELECT * FROM products WHERE name LIKE "%'+req.body.search+'%";';
 let query = db.query(sql, (err,res1) =>{
  if(err) throw(err);
 // res.redirect("/error")
  res.render('products', {root: VIEWS, res1});
  console.log("Search for " + "%'+req.body.search+'%");
  wstream.write("Search for " + "%'+req.body.search+'%" + " at " +  + new Date(Date.now()).toLocaleString());
 });
});

// end search function

//-----USER
// SQL create product table Example
app.get('/create-users-table', function(req, res) {
  //let sql = 'DROP TABLE users;'

  let sql = 'CREATE TABLE users ( Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Fname varchar(255), Lname varchar(255), Email varchar(255) NOT NULL, Password varchar(50) NOT NULL);';
    let query = db.query(sql, (err, res) => {
      if(err) throw err;
       console.log(res);
      });
    res.send("Well done users table created...");
});

//taking data from a form in the views - post request
app.post('/new-user', function(req, res) {
  let sql = 'INSERT INTO users ( Fname, Lname, Email, Password) VALUES ("'+req.body.fname+'", "'+req.body.lname+'", "'+req.body.email+'", "'+req.body.password+'")';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    wstream.write('\nuser created ' + req.body.lname + ' ' + new Date(Date.now()).toLocaleString());
  });
  //res.send("Well done, new user created...");
  res.render('index.jade', {root: VIEWS}); // use the render command so that the response object renders a HHTML page
  console.log("Now you are on the home page!");
});

app.get('/users', function(req, res){
 let sql = 'SELECT * FROM users';
 let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    res.render('users.jade', {root: VIEWS, res1});
    //res.send(res1); //showa table contents but needs style
    console.log(res1);
     wstream.write('\nall users listing ' + new Date(Date.now()).toLocaleString());
  });
  //console.log("Now you are on the products page! Session set as seen on products page " + req.session.email);
  console.log("Now you are on the users page! ");
});


//view a USER
app.get('/user/:id', function(req, res){
 let sql = 'SELECT * FROM users WHERE Id = "'+req.params.id+'";';
 console.log(req.params.id);
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nuser edit page ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.render('user.jade', {root: VIEWS, res1});// use the render command so that the response object renders a HHTML page
 });
 console.log("Now you are on the edit user page!");
});

//edit the USER data from the form 
app.get('/edit-user/:id', function(req, res){
    let sql = 'SELECT * FROM users WHERE Id = "'+req.params.id+'";';
     let query = db.query(sql, (err, res1) =>{
             if(err) throw err;
             console.log(res);
       
     wstream.write('\nuser edited ' + req.body.id + ' ' + new Date(Date.now()).toLocaleString());
     res.render('edit-user', {root: VIEWS, res1});
    });
});

//take the USER data from the form to the database
app.post('/edit-user/:id', function(req, res){
    let sql = 'UPDATE users SET Fname = "'+req.body.newfname+'", Lname = "'+req.body.newlname+'",Email = "'+req.body.newemail+'", Password = "'+req.body.newpassword+'" WHERE Id = "'+req.params.id+'";';
        let query = db.query(sql, (err, res) =>{
             if(err) throw err;
             console.log(res);
        });
        wstream.write('\nuser edited ' + req.body.newname + ' ' + new Date(Date.now()).toLocaleString());
    res.redirect("/user/" + req.params.id);
});


// function to delete USER data based on button press and form
app.get('/delete-user/:id', function(req, res){
 let sql = 'DELETE FROM users WHERE Id = "'+req.params.id+'";';
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nuser deleted ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.redirect('/users'); // use the render command so that the response object renders a HHTML page
 });
 console.log("User Gone!");
});

// Search USER table function 
app.post('/search-user', function(req, res){
 let sql = 'SELECT * FROM users WHERE name LIKE "%'+req.body.search+'%";';
 let query = db.query(sql, (err,res1) =>{
  if(err) throw(err);
 // res.redirect("/error")
  res.render('users', {root: VIEWS, res1});
  console.log("Search for user " + "%'+req.body.search+'%");
  wstream.write("Search for user " + "%'+req.body.search+'%" + " at " +  + new Date(Date.now()).toLocaleString());
 });
});

// end search function


/*
Routes a get request, and in this simple case - to the server's root. It sends a 
call back to handle the request. Not much will happen here, the call back is hardcoded  
to send a hello world string. But in theory you can do something with the req variable 
in the "/" directory, create a dynamic html and send that back
*/

// function to render the home page
app.get('/', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
 //res.send("<h1>hello world</h1>"); //it will pring this onscreen
  res.render('index.jade', {root: VIEWS, title: 'Homepage'}); //render() will show the .jade as HTML
  console.log("Now you are on the home page!");
});

// function to render the products page
app.get('/products', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
  res.render('products.jade', {root: VIEWS}); // use the render command so that the response object renders as a HTML page
  console.log("Now you are on the products page!");
});

// function to render the products page
app.get('/new-product', function(req, res){
  res.render('new-product.jade', {root: VIEWS});  // use the render command so that the response object renders a HHTML page
  console.log("Now you are on the new product page!");
});

// function to render the products page
app.get('/new-user', function(req, res){
  res.render('new-user.jade', {root: VIEWS}); // use the render command so that the response object renders a HHTML page
  console.log("Now you are on the new user page!");
});

// function to render the users page
app.get('/users', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
  res.render('users.jade', {root: VIEWS}); // use the render command so that the response object renders as a HTML page
  console.log("Now you are on the users listing page!");
});

/*
Firing up your server. For most of us noobs - all that matters here is
a) remember the port number - 8080 (in this example). If you use some other port 
number make sure you mention it explicitly when you make a call to the server.
b) the console statement is just a note to tell you the server is running
 */
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
  wstream.write('\nExample app listening on port 8080, in c9 goto http://<workspace name>-<user name>.c9users.io');
});

//github testing