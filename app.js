
MICROSOFT_APP_ID="2077f0e5-db11-4f08-aa45-1add8b67f3ef"
MICROSOFT_APP_PASSWORD="jnxaiIPI53@)pkKNZR948$}"

//require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
	console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID /* MICROSOFT_APP_ID */,
	appPassword: process.env.MICROSOFT_APP_PASSWORD /* MICROSOFT_APP_PASSWORD */
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said: ')
var bot = new builder.UniversalBot(connector, function (session) {
	session.send("You said: %s", session.message.text);
});
