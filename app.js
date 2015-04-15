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
	req.login = function(user,specialist) {
		req.session.specialist = specialist;
		req.session.userId = user.id;
		console.log('\n\n\n\n\n\n\n\n\n', req.session);
	};
	req.currentUser = function(specialist) {
		if (req.session.specialist) {
			console.log("IM SPECIaLIST");
		  return db.Specialist.find(req.session.userId)
			.then(function(user) {
				req.user = user;
				return user;
			});
		} else {
		  return db.User.find(req.session.userId)
			.then(function(user) {
				req.user = user;
				return user;
			});
		}
	};
	req.logout = function() {
		req.session.userId = null;
		req.session.specialist = null;
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

//Set up Site Routes...
app.get('/', function(req, res) {
	res.render('index', {title: "The Pain Free App"});
});
//Set up User Routes...
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
	  	if(user.first_name) {
	  		res.redirect('/users/index');
	  	} else {
	  		res.redirect("/profile");
	  	}
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

app.get('/users/index', function(req, res, user) {
	res.render('users/index', {user: user});
});

//Set up DailyLog Routes...
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

//Set up Specialist Routes...
app.get("/specialists/signup", function(req, res) {
	res.render("specialists/signup");
});

app.post("/specialists/signup", function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	db.Specialist.createSecure(email, password)
	  .then(function(specialist) {
	  	if(specialist) {
	  		req.login(specialist,true);
	  		res.redirect("/specialists/profile");
	  	} else {
	  		 res.redirect("/specialists/login");
	  	}
	  });
});

app.get("/specialists/login", function(req, res) {
	req.currentUser().then(function(specialist) {
		if (specialist) {
			res.redirect('/specialists/profile');
		} else {
			res.render('specialists/login');
		}
	});
});

app.post("/specialists/login", function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	db.Specialist.authenticate(email, password)
	  .then(function(specialist) {
	  if(specialist) {
	  	req.login(specialist, true);
	  	res.redirect("/specialists/profile");
	  } else {
	  	 res.redirect("/specialists/login");
	  }
	  });
});

app.get("/specialists/profile", function(req, res) {
	req.currentUser()
	   .then(function(specialist) {
	   if (specialist) {
	   	//console.log("THIS IS SPECIALIST", specialist);
	   		res.render('specialists/profile', {specialist: specialist});
	   } else {
	   	 res.redirect('/specialists/login');
	   }
	});
});

app.put("/specialists/profile", function(req, res) {
	req.currentUser()
	  .then(function(specialist){
	  	specialist.updateAttributes(req.body)
	  	  .then(function(specialist){
	  	  	res.redirect('/specialists/index');
	  	  });
	});
});

app.delete("/logout", function(req, res) {
	req.logout();
	res.redirect('/login');
});

app.get('/specialists/index', function(req, res, specialist) {
	res.render('specialists/index', {specialist: specialist});
});

app.get('/specialists/specialist', function(req, res) {
	db.User.findAll(
		{where: {SpecialistId: req.session.specialistId}})
		.then(function(users) {
			res.render("specialists/specialist", {users: users});
	});
});

// app.get('/specialists/:id', function (req, res) {
// 	db.Specialist.find(req.params.id)
// 				 .then(function(specialist) {
// 				 	res.render('specialists/specialist', {specialist: specialist});
// 				 });
// });





db.sequelize.sync().then(function() {
	app.listen(3000, function() {
		console.log("Listening on PORT 3000!")
	}); 
});









