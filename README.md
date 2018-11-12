# node-exmple

This was done in a [Cloud9](https://c9.io/login) Node workspace

To set up the environment
    
    $ npm install
    
    $ npm install mysql
    
    $ npm install body-parser
    

	$ mkdir myapp
	
	$ cd myapp
	
	$ npm init //set the entry point: (index.js) change to app.js

	$ npm install express --save
	
	$ npm install mysql --save  //as I am using a mysql DB

	$ npm install jade //to use jade in your app

	$ npm install body-parser --save

	$ npm install node.date-time  //so I can use a timestamp in the log file
	
	$ npm install connect-flash
	
	$ npm install express-flash -save
	
	$ npm install express-session -save
	
	$ npm install express-myconnection -save
	
	$ npm install express-validator -save


I set a free mysql database in [Gearhost](http://gearhost.com) and the project links to it.
Use Workbench, set up a new connection with the details from Gearhost and view database locally.

Possibilities: [Tutorial](http://blog.chapagain.com.np/node-js-express-mysql-simple-add-edit-delete-view-crud/)

Functionality includes:
- create tables for items, users
- CRUD for items
- CRUD for users
- CRUD the reviews in JSON
- Uses a view engine with block content
- log file of activity created

