// Standard set up for the express code to work with your code
var express     = require('express'),
  bodyParser  = require("body-parser"), //allows data to be passed through the body to other places
  jade        = require('jade'),
  fs          = require('fs'),      //file system, to access files like text, json, xml
  http        = require('http'),
  mysql       = require('mysql'),
  flash       = require('express-flash'),
  //expressValidator = require('express-validator'),
  //validate = require('express-validation'),
  util     = require('util');

var app         = express();
  
const path      = require('path');
const VIEWS     = path.join(__dirname, 'views');
app.set('view engine', 'jade');

require('dotenv').config(); //for creating environment variables in the .env file used for DB connection

console.log('current: ' + new Date(Date.now()).toLocaleString());    //testing by sending current timestamp to console
var wstream = fs.createWriteStream('./logs/logger.txt');    //create a log of activity with current timestamp in a file called logger.txt
wstream.write('Log file opened\n');
//wstream.end();

var reviews = require("./models/reviews.json")
var contact = require("./models/contact.json")
var logger = require("./logs/logger.txt")

var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({ 
  secret: "topsecret",
  resave: true,
  saveUninitialized: true
})); // Requird to make the session accessable throughouty the application


app.use(express.static("scripts"));  // allow the application to access the scripts folder contents to use in the application
app.use(express.static("images"));   // allow the application to access the images folder contents to use in the application
app.use(express.static("views"));    // Allow access to content of views folder
app.use(express.static("models"));   // Allow access to content of models folder where JSON is
app.use(express.static("views/user"));
app.use(flash()); //to show alerts/messages in the view
//app.use(expressValidator());
app.use(bodyParser.urlencoded({extended:true})); //place in general that which uses it


//my gearhost MYSQL db credentials to create a connection.
//using https://codeburst.io/how-to-easily-set-up-node-environment-variables-in-your-js-application-d06740f9b9bd
//to create a gitignore to secure my DB credentials which are environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


db.connect(function (err){
 if(!err){
  console.log("DB connected");
  wstream.write('\nConnected to gearhost DB...');
 }else{
  console.log("Error connected DB");
  wstream.write('\nerror connecting to gearhost db');
 }
});

global.product_id;

// SQL create product table Example
app.get('/create-products-table', function(req, res) {
  //let sql = 'DROP TABLE products;'
  let sql = 'CREATE TABLE products ( Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Price decimal(5, 2), Image varchar(255), Activity varchar(255));';
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
  res.redirect('/products'); // redirect to product funtion so it will render the view with the row data 
  console.log("Now you are on the products page!");
});

app.get('/products', function(req, res){
 let sql = 'SELECT * FROM products';
 let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    res.render('products.jade', {root: VIEWS, res1, reviews, title: 'Products listing', messages: '   '});
    
    //res.send(res1); //shows table contents but needs style
    console.log(res1);
     wstream.write('\nall product listing and JSON reviews display' + new Date(Date.now()).toLocaleString());
  });
  //console.log("Now you are on the products page! Session set as seen on products page " + req.session.email);
  console.log("Now you are on the products page! ");
});


// function to render the individual products page {user: req.user,} 
app.get('/item/:id', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
 let sql = 'SELECT * FROM products WHERE Id = "'+req.params.id+'";';
 global.product_id = req.params.id;
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  res.render('item.jade', {root: VIEWS, res1, title: 'Item view', messages: '   '}); // use the render command so that the response object renders a HHTML page
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
  res.render('edit-product', {root: VIEWS, res1, title: 'Edit product', messages: '   '});// use the render command so that the response object renders a HHTML page
 });
 console.log("Now you are on the edit product page!");
});

//print log files from server to page
app.get('/random', function(req, res) {
    let  logdata = fs.readFileSync('./logs/logger.txt');
    res.render('random.jade', {root: VIEWS, res, logdata , title: 'Random', messages: '   '});
    console.log("on random page ", logdata);
});

//take the data from the form to the database
app.post('/edit-product/:id', function(req, res){
    let sql = 'UPDATE products SET Name = "'+req.body.newname+'", Price = "'+req.body.newprice+'", Activity = "'+req.body.newactivity+'", Image = "'+req.body.newimage+'" WHERE Id = "'+req.params.id+'";';
        let query = db.query(sql, (err, res) =>{
             if(err) throw err;
             console.log(res);
        });
        wstream.write('\nproduct edited ' + req.body.newname + ' ' + new Date(Date.now()).toLocaleString());
    res.redirect("/item/" + req.params.id); //redirect to the item listing with the param
});


// function to delete product data based on button press and form
app.get('/delete/:id', function(req, res){
 let sql = 'DELETE FROM products WHERE Id = "'+req.params.id+'";';
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nproduct deleted ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.redirect('/products'); // use the redirect to go to that funtion which will then render the page with data
 });
 console.log("Its Gone!");
});

// Search products table function 
app.post('/search', function(req, res){
 let sql = 'SELECT * FROM products WHERE name LIKE "%'+req.body.search+'%";';
 let query = db.query(sql, (err,res1) =>{
  if(err) throw(err);
 // res.redirect("/error")
  res.render('products', {root: VIEWS, res1, title: 'Products listing from search', messages: '   '});
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
  let user_
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    wstream.write('\nuser created ' + req.body.lname + ' ' + new Date(Date.now()).toLocaleString());
  });
  //res.send("Well done, new user created...");
  res.render('index.jade', {root: VIEWS, title: 'Home', messages: 'Hi new user'}); // use the render command so that the response object renders a HHTML page
  console.log("Now you are on the home page!");
});

app.get('/users', function(req, res){
 let sql = 'SELECT * FROM users';
 let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    res.render('users.jade', {root: VIEWS, res1, messages: '   '});
    //res.send(res1); //showa table contents but needs style
    console.log(res1);
     wstream.write('\nall users listing ' + new Date(Date.now()).toLocaleString());
  });
  //console.log("Now you are on the products page! Session set as seen on products page " + req.session.email);
  console.log("Now you are on the users page! ");
});

//-----------------register a new user, login & logout
// Render register page 
app.get('/new-user', function(req, res){
 res.render('new-user', {root:VIEWS, title: 'Register'});
});

// stick user into database 

app.post('/new-user', function(req, res){
  db.query('INSERT INTO users (Name, Email, Password) VALUES ("'+req.body.name+'", "'+req.body.email+'", "'+req.body.password+'")');
  req.session.email =  "LoggedIn";   
  // req.session.who =  req.body.name;
  res.render('/', {root:VIEWS, title: 'home', messages: 'You are registered'});   
});


// Render login page 
app.get('/login', function(req, res){
 res.render('login', {root:VIEWS, title: 'Login'});
});


app.post('/login', function(req,res){
 var email= req.body.email;
 var password = req.body.password;
 db.query('SELECT email, password FROM users WHERE email = ?',[email], function (error, results, fields) {
  if (error) {
		// console.log("error ocurred",error);
		res.send({
		  "code":400,
		  "failed":"error ocurred"
		})
  }else{
		// console.log('The solution is: ', results);
		if(results.length >0){
		  if(results[0].password == password){
		   res.render('index', {root:VIEWS,  messages: 'Login successful'});
			  //res.send({
			  //"code":200,
			  //"success":"login sucessfull"
				//});
				
		  }else{
		    res.render('index', {root:VIEWS,  messages: 'Email and password do not match'});
			 //res.send({
			  
			  //"code":204,
			  //"success":"Email and password does not match"
				//});
		  }
		}
		else{
		 res.render('index', {root:VIEWS,  messages: 'Email does not exist'});
		 // res.send({
			//"code":204,
		//	"success":"Email does not exits"
		//	  });
		}
  }
  }); //end db.query
}); //end function



// Log Out Route 

app.get('/logout', function(req, res){
 res.render('index', {root:VIEWS,  messages: 'Logged out'});
 req.session.destroy(session.email);
 console.log("logged out");
});

// end logout route 
//-----------------------------------------


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
     res.render('edit-user', {root: VIEWS, res1, title: 'Edit User'});
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
  res.render('index.jade', {root: VIEWS, messages: 'User deleted'}); // use the render command so that the response object renders a HHTML page
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
  res.render('index.jade', {root: VIEWS, title: 'Homepage', messages: '  '}); //render() will show the .jade as HTML
  console.log("Now you are on the home page!");
});

// function to render the products page
app.get('/products', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
  res.render('products', {root: VIEWS, title: 'All Products', messages: '   '}); // use the render command so that the response object renders as a HTML page
  console.log("Now you are on the products page!");
});

// function to render the products page
app.get('/new-product', function(req, res){
  res.render('new-product.jade', {root: VIEWS, title: 'New Product', messages: '   '});  // use the render command so that the response object renders a HHTML page
  console.log("Now you are on the new product page!");
});

// function to render the products page
app.get('/new-user', function(req, res){
  res.render('new-user.jade', {root: VIEWS, title: 'New User', messages: '   '}); // use the render command so that the response object renders a HHTML page
  console.log("Now you are on the new user page!");
});

// function to render the users page
app.get('/users', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
  res.render('users.jade', {root: VIEWS, title: 'Users listing', messages: '    '}); // use the render command so that the response object renders as a HTML page
  console.log("Now you are on the users listing page!");
});



app.get('/contactus', function(req, res){
  res.render('addcontact', {root:VIEWS});
  console.log("You are on the contact page");
  
});

//this request will send data to the json file in the model
app.post('/contactus', function(req, res){
  var count = Object.keys(contact).length;
  console.log(count);
  
  //res.render('contact', {root:VIEWS});
  var max
  //standard javajscript function to get max id in json file and new one will be +1
  function getMax(contacts, id){
    //var max
    for(var i=0; i<contacts.length; i++){
      if(!max || parseInt(contact[i][id]) > parseInt(max[id]))
        max = contacts[i];
    }
    return max;
  }
  var maxPpg = getMax(contact, "id"); //call the above function and passes the result to a var called maxCid
  var newId = maxPpg.id + 1;
  console.log(newId);
  var formData = {
   id: newId,
   name: req.body.name,
   email: req.body.email,
   comment: req.body.comment
  };
  console.log(formData);
  
  //steps - stringify json, push new code, splice it and add new element, structure it back to json again
  var json = JSON.stringify(contact); //stringify JSON data, convert to string
  //function reads new data and pushes it to json file
  fs.readFile('./models/contact.json', 'utf8', function readFileCallback(err, data){
   if(err){
     throw(err); //means it will stop and throw full err code in console
     //res.redirect("/oops"); //if error send them to a page
   }else{
     
     contact.push(formData); //send data to json file
     json = JSON.stringify(contact, null, 4); //converts to a json file, null and 4 represent how it is structured or styled
     // the 4 is the indentation, so not just a long line of code
     fs. writeFile('./models/contact.json', json, 'utf8');
   }
  });
  //res.redirect("/thanks");
  res.render('thanks', {root:VIEWS});
  
});


/*
Firing up your server. For most of us noobs - all that matters here is
a) remember the port number - 8080 (in this example). If you use some other port 
number make sure you mention it explicitly when you make a call to the server.
b) the console statement is just a note to tell you the server is running
 */
//app.listen(8080, function () {
//  console.log('Example app listening on port 8080!');
//  wstream.write('\nExample app listening on port 8080, in c9 goto http://<workspace name>-<user name>.c9users.io');
//});

var port = process.env.PORT || 3000;
app.listen(port);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
