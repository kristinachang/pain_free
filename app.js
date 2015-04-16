var express = require("express");
var request = require("request");
var ejs = require("ejs");
var session = require("express-session");	
var pg = require("pg");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

var app = express();
var db = require('./models');

var accountSid = 'AC0c28892f41cd56992a3988d7c5ed33f4';
var authToken = "d53bae72f182971a1e040a3224bd18e6";
var client = require('twilio')(accountSid, authToken);



app.set('view engine', 'ejs');
app.use("/", function (req, res, next) {
	req.login = function(user, specialist) {
		if (user) {
			console.log("req.login => I'M A USER!");
			req.session.userId = user.id;
		} else if (specialist) {
			console.log("req.login => I'M A SPECIALIST!");
			req.session.specialist = specialist.id;
		}
		// console.log('\n\n\n\n\n\n\n\n\n', req.session.specialist);
	};
	req.currentUser = function(specialist) {
		if (req.session.specialist) {
			console.log("req.currentuser() => IM A SPECIALIST");
		  return db.Specialist.find(req.session.specialist)
			.then(function(user) {
				req.user = user;
				return user;
			});
		} else {
			console.log("req.currentuser() => IM A USER");
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
	res.render('site/index', {title: "The Pain Free App"});
});

app.get('/about', function(req, res) {
	res.render('site/about');
});
app.get('/contact', function(req, res) {
	res.render('site/contact');
})

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
			if (!user.SpecialistId) {
				req.logout();
				res.redirect('/login');
			} else {
			res.redirect('/profile');
			}
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
	  	req.login(user, null);
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
   	   db.Specialist.all().then(function(specialists) {
		 res.render('users/profile', {user: user, specialists: specialists});
	   	})
	   } else {
	   	 res.redirect('/login');
	   }
	});
});

app.put("/profile", function(req, res) {
	req.currentUser()
	  .then(function(user){
	  	user.updateAttributes(req.body.user)
	  	  .then(function(user){
	  	  	res.redirect('/users/index');
	  	  });
	});
});

app.delete("/logout", function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/users/index', function(req, res, user) {
	res.render('users/index', {user: user});
});

app.get('/users/:id', function(req, res) {
	db.User.find({ where: {id: req.params.id}, include: [db.Daily]})
			.then(function(user) {
				res.render('users/user', {userDisplay: user});
	});
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
				req.currentUser().then(function(user){
				    client.messages.create({
				    body: req.body.daily.comment,
				    to: "+14088987910", // user.getSpecialist.phone
				    from: "+14087405373"
					}, function(err, message) {
   					 process.stdout.write(message.sid);
   					 res.redirect('/dailies');
					});
				});
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
	  		console.log('/specialists/signup - specialist is TRUE');
	  		req.login(null, specialist);
	  		res.redirect("/specialists/profile");
	  	} else {
	  		console.log('else /specialists/login - specialist is FALSE');
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
	  	req.login(null, specialist);
	  	//req.login(specialist, true);
	  	if(specialist.first_name) {
	  		res.redirect("/specialists/index");
	  	} else {
	  		res.redirect("/specialists/profile");
	  	}
	  } else {
	  	 res.redirect("/specialists/login");
	  }
	});
});

app.get("/specialists/profile", function(req, res) {
	req.currentUser()
	   .then(function(specialist) {
	   if (specialist) {
	   	console.log("THIS IS SPECIALIST", specialist);
	   	  if (!specialist.special) {
	   		console.log('I AM NOT A SPECIALIST');
	   	  	req.logout();
	   	  	console.log('SORRY redirect to specialists/login');
	   	  	res.redirect('/specialists/login');
	   	  } else {
	   	  	console.log("YOU'RE IN!");
	   		res.render('specialists/profile', {specialist: specialist});
	   		}
	   } else {
	   		console.log('ELSE redirect to specialists/login');
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
	res.redirect('/');
});

app.get('/specialists/index', function(req, res, specialist) {
	res.render('specialists/index', {specialist: specialist});
});

app.get('/specialists/specialist', function(req, res) {
	db.Specialist.find(req.session.specialist).then(function(specialist) {
		var users = db.User.findAll(
			{where: {SpecialistId: specialist.id}})
			.then(function(users) {
				// console.log(users);
				res.render("specialists/specialist", {users: users, specialist: specialist});
		});
	})
});

// app.get('/specialists/:id', function (req, res) {
// 	db.Specialist.find(req.params.id)
// 				 .then(function(specialist) {
// 				 	res.render('specialists/specialist', {specialist: specialist});
// 				 });
// });





db.sequelize.sync().then(function() {
	app.listen(process.env.PORT || 3000, function() {
		console.log("Listening on PORT 3000!")
	}); 
});









