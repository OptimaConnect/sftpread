'use strict';

// Module Dependencies
require('dotenv').config();
var express     		= require('express');
var bodyParser  		= require('body-parser');
var errorhandler 		= require('errorhandler');
var http        		= require('http');
var path        		= require('path');
var request     		= require('request');
var urlencodedparser 	= bodyParser.urlencoded({extended:false});
var app 				= express();
var Client 				= require('ssh2-sftp-client');

let sftp 				= new Client();

var returnedFiles;


// access Heroku variables
// access Heroku variables
var marketingCloud = {
  sftpUrl: process.env.sftpUrl,
  sftpPort: process.env.sftpPort,
  sftpUser: process.env.sftpUser,
  sftpPassword: process.env.sftpPassword
};

// Configure Express
app.set('port', process.env.PORT || 3000);
//app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
	app.use(errorhandler());
}

// listening port
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', (req, res) => res.send('Hello World!'));


app.get('/readFtpFolder/:enviro/:interface/:folder', function(req, res) {

	console.log(`Enviro is ${req.params.enviro} | Interface is ${req.params.interface} | Folder is ${req.params.folder}`);

	// access SFTP site
	sftp.connect({
		host: marketingCloud.sftpUrl,
		port: marketingCloud.sftpPort,
		username: marketingCloud.sftpUser,
		password: marketingCloud.sftpPassword,
		readyTimeout: 60000
	}).then(() => {
		return sftp.list("/Export/" + req.params.enviro + "/" + req.params.interface + "/" + req.params.folder);
	}).then(response => {
		//console.log(data, 'the data info');
		console.dir(response);
		//console.dir("Filename is " + response[0]['name']);
		// loop through results, make sure
		var highestTimestamp = 0;
		var fileName;
		var i = 0 ;
		for ( i = 0; i < response.length; i++ ) {
			console.dir("Filename is " + response[i]['name']);
			console.dir("Timestamp for this row " + response[i]['modifyTime']);

			if ( response[i]['modifyTime'] > highestTimestamp ) {
	        	highestTimestamp = response[i]['modifyTime'];
	        	
	        	console.dir(response[i]['name']);
	        	fileName = response[i]['name'];
	    	}
	    	console.dir("Current highest timestamp is " + highestTimestamp);
	    	console.dir(highestTimestamp);
		}
		sftp.end();
		console.dir("Filename with highest timestamp is " + fileName);
		res.send(fileName);


	}).catch(err => {
		sftp.end();
		console.log(err, 'catch error');
	});

	
	//return fileName;


});
