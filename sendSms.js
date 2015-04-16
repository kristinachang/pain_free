//var accountSid = 'PN745743b12203ed088bfbb2d1dc63db8b';
var accountSid = 'AC0c28892f41cd56992a3988d7c5ed33f4';
var authToken = "d53bae72f182971a1e040a3224bd18e6";
var client = require('twilio')(accountSid, authToken);
 
client.sms.messages.post({
    body: "HEY.. It worked!",
    to: "+17143009259",
    from: "+14087405373"
}, function(err, message) {
	if (err) {
		throw err;
	} else {
		 process.stdout.write(message.sid);
	}
});
