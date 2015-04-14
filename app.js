var express = require("express");
var request = require("request");
var ejs = require("ejs");
var session = require("express-session");	
var pg = require("pg");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

var app = express();
var db = require('./models');

app.set('view engine', 'ejs');
app.use("/", function (req, res, next) {
	req.login = function(user) {
		req.session.userId = user.id;
	};
	req.currentUser = function() {
		return db.User.find(req.session.userId)
			.then(function(user) {
				req.user = user;
				return user;
			});
	};
	req.logout = function() {
		req.session.userId = null;
		req.user = null;
	};
	next(); 
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({
	secret: 'super secret',
	resave: false,
	saveUninitialized: true
}));

//Set up ROUTES...
app.get('/', function(req, res) {
	res.render('index', {title: "The Pain Free App"});
});

app.get("/signup", function(req, res) {
	res.render("users/signup");
});

app.post("/signup", function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	db.User.createSecure(email, password)
	  .then(function(user) {
	  	if(user) {
	  		req.login(user);
	  		res.redirect("/profile");
	  	} else {
	  		 res.redirect("/login");
	  	}
	  });
});

app.get("/login", function(req, res) {
	req.currentUser().then(function(user) {
		if (user) {
			res.redirect('/profile');
		} else {
			res.render('users/login');
		}
	});
});

app.post("/login", function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	db.User.authenticate(email, password)
	  .then(function(user) {
	  if(user) {
	  	req.login(user);
	  	res.redirect("/profile");
	  } else {
	  	 res.redirect("/login");
	  }
	  });
});

app.get("/profile", function(req, res) {
	req.currentUser()
	   .then(function(user) {
	   if (user) {
	   	//console.log("THIS IS USER", user);
	   		res.render('users/profile', {user: user});
	   } else {
	   	 res.redirect('/login');
	   }
	});
});

//should be put
app.put("/profile", function(req, res) {
	req.currentUser()
	  .then(function(user){
	  	user.updateAttributes(req.body)
	  	  .then(function(user){
	  	  	res.redirect('/users/index');
	  	  });
	});
});

app.delete("/logout", function(req, res) {
	req.logout();
	res.redirect('/login');
});


//ROUTES...
app.get('/users/index', function(req, res, user) {
	res.render('users/index', {user: user});
})

app.get('/dailies', function(req, res) {
	db.Daily.findAll(
		{where: {UserId: req.session.userId}})
		.then(function(dailies) {
			res.render("dailies/index", {dailiesList: dailies});
	});
});

app.get('/dailies/new', function(req, res) {
  		res.render('dailies/new', {UserId: req.session.userId});
});

app.post('/dailies', function(req, res) {
	db.Daily.create(req.body.daily)
			  .then(function(dailies) {
			  	res.redirect('/dailies');
			  });
});

app.get('/dailies/:id', function(req, res) {
	db.Daily.find(req.params.id)
			  .then(function(daily) {
			  	res.render('dailies/daily', {dailyDisplay: daily});
	});
});










db.sequelize.sync().then(function() {
	app.listen(3000, function() {
		console.log("Listening on PORT 3000!")
	}); 
});









