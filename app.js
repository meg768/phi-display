
var app      = require('express')();
var server   = require('http').Server(app);
var schedule = require('node-schedule');

var config   = require('./config');
var sprintf  = require('./common/sprintf.js');
var matrix   = require('./common/matrix.js');


// Set the time zone according to config settings
process.env.TZ = config.timezone;

// Listen on port 5000
server.listen(process.env.PORT || 5000);


// We need to initialize the display...
matrix.init(server);

// Any request at the root level will return OK
app.get('/', function (req, response) {
	response.send("OK");
});

//////////////////////////////////////////////////////////////////////////////////////////

// Make sure Heroku doesn't put our process to sleep...
function enablePing() {

	var config = {
		host: 'phi-display.herokuapp.com',
		path: '/',
		schedule: {
			hour   : new schedule.Range(7, 23),
			minute : new schedule.Range(0, 59, 15)
		}
	};
	
	var Ping = require('./modules/ping.js');
	var ping = new Ping(config);
}

//////////////////////////////////////////////////////////////////////////////////////////

/*
function enableFinance() {
	
	var latestQuote = undefined;
	
	var config = {
	
		'rates' : [
			{ 'name':'USD/SEK', 'symbol':'USDSEK' },
			{ 'name':'EUR/SEK', 'symbol':'EURSEK' }
		],
		
		'quotes' : [
			{ 'name':'Phase',  'symbol':'PHI.ST' }
		]
	};
	
	var Finance = require('./modules/finance');
	var finance = new Finance(config);

	function scheduleQuotes() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 2);
		rule.hour   = new schedule.Range(9, 17);
	
		finance.fetchQuotes();
		
		var job = schedule.scheduleJob(rule, function() {
			finance.fetchQuotes();
		});
		
	}
	
	function scheduleRates() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 13);
		rule.hour   = new schedule.Range(7, 23);
	
		var job = schedule.scheduleJob(rule, function() {
			finance.fetchRates();
		});
		
	}

	function scheduleDisplayQuotes() {
		var rule    = new schedule.RecurrenceRule();
		rule.hour   = new schedule.Range(7, 23, 1);
		rule.second = new schedule.Range(0, 59, 10);
		
		schedule.scheduleJob(rule, function() {
			var display = new matrix.Display();
			
			display.image('images/phiab-logo.png');
	
			if (latestQuote != undefined) {
				var options = {};
				options.font     = 'Century-Gothic-Bold-Italic';
				options.size     = 26;
				
				options.color = 'white';
				display.text(sprintf('%.2f', latestQuote.price), options);

				options.color = latestQuote.change >= 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)';
				display.text(sprintf('%s%.1f%%', latestQuote.change >= 0 ? '+' : '', latestQuote.change), options)

				options.color = 'blue';
				display.text(sprintf('%.1f MSEK', (latestQuote.volume * latestQuote.price) / 1000000.0), options);

			}
			
			display.send({priority:'low'});
		});			
		
	}	

	finance.on('quote', function(name, symbol, price, change, volume) {
		latestQuote = {
			name:name,
			symbol:symbol,
			price:price,
			volume:volume,
			change:change
		}
	});

	finance.on('rate', function(name, symbol, value) {
		matrix.text(sprintf('%s %.2f', name, value), {color:'rgb(0,0,255)'});
	});

	scheduleQuotes();
	scheduleRates();
	scheduleDisplayQuotes();

}
*/

//////////////////////////////////////////////////////////////////////////////////////////

function enableQuotes() {
	
	
	var config = {
	
		'quotes' : [
			{ 'name':'Phase',  'symbol':'PHI.ST' }
		]
	};
	
	var Quotes = require('./modules/quotes.js');
	var quotes = new Quotes(config);
	var quote  = undefined;

	function scheduleFetch() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 1);
		rule.hour   = new schedule.Range(9, 17);
	
		quotes.fetch();
		
		var job = schedule.scheduleJob(rule, function() {
			quotes.fetch();
		});
		
	}
	
	function scheduleDisplay() {
		var rule    = new schedule.RecurrenceRule();
		rule.hour   = new schedule.Range(7, 23, 1);
		rule.second = new schedule.Range(0, 59, 10);
		
		schedule.scheduleJob(rule, function() {
			var display = new matrix.Display();
			
			display.image('images/phiab-logo.png');
	
			if (quote != undefined) {
				var options = {};
				options.font     = 'Century-Gothic-Bold-Italic';
				options.size     = 26;
				
				options.color = 'white';
				display.text(sprintf('%.2f', quote.price), options);

				options.color = quote.change >= 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)';
				display.text(sprintf('%s%.1f%%', quote.change >= 0 ? '+' : '', quote.change), options)

				options.color = 'blue';
				display.text(sprintf('%.1f MSEK', (quote.volume * quote.price) / 1000000.0), options);

			}
			
			display.send({priority:'low'});
		});			
		
	}	

	quotes.on('quote', function(data) {
		quote = data;
	});

	scheduleFetch();
	scheduleDisplay();

}
//////////////////////////////////////////////////////////////////////////////////////////

function enableRates() {
	
	
	var config = {
	
		'rates' : [
			{ 'name':'USD/SEK', 'symbol':'USDSEK' },
			{ 'name':'EUR/SEK', 'symbol':'EURSEK' }
		]
	};
	
	var Rates = require('./modules/rates');
	var rates = new Rates(config);
	var rate  = undefined;

	function scheduleFetch() {
		var rule = new schedule.RecurrenceRule();		
		
		rule.minute = new schedule.Range(0, 59, 13);
		rule.hour   = new schedule.Range(7, 23);
	
		var job = schedule.scheduleJob(rule, function() {
			rates.fetch();
		});
		
	}

	function scheduleDisplay() {
		var rule    = new schedule.RecurrenceRule();
		rule.hour   = new schedule.Range(7, 23, 1);
		rule.second = new schedule.Range(0, 59, 10);
		
		schedule.scheduleJob(rule, function() {
			var display = new matrix.Display();
			
			display.image('images/phiab-logo.png');
	
			if (rate != undefined) {
				var options = {};
				options.font     = 'Century-Gothic-Bold-Italic';
				options.size     = 26;
				
				options.color = 'white';
				display.text(sprintf('%.2f', rate.price), options);

				options.color = latestQuote.change >= 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)';
				display.text(sprintf('%s%.1f%%', rate.change >= 0 ? '+' : '', rate.change), options)

				options.color = 'blue';
				display.text(sprintf('%.1f MSEK', (latestQuote.volume * latestQuote.price) / 1000000.0), options);

			}
			
			display.send({priority:'low'});
		});			
		
	}	

	rates.on('rate', function(name, symbol, value) {
		matrix.text(sprintf('%s %.2f', name, value), {color:'rgb(0,0,255)'});
	});

	scheduleFetch();
	scheduleDisplay();

}


//////////////////////////////////////////////////////////////////////////////////////////

function enableMail() {
	
	var config = {
		email    : 'phiab.display@gmail.com',
		password : 'P0tatismos'
		
	};
	
	var Mail = require('./modules/mail.js');	
	var mail = new Mail(config);
	
	mail.on('mail', function(mail) {
		if (mail.text == undefined)
			mail.text = '';
			
		if (mail.subject == undefined)
			mail.subject = '';
			
		if (mail.headers && mail.headers['x-priority'] == 'high')
			matrix.play('beep3.mp3');
	
		matrix.text(mail.subject + '\n' + mail.text);		
	});
}

//////////////////////////////////////////////////////////////////////////////////////////

function enableWeather() {

	var config = {
		schedule: {
			hour:   new schedule.Range(7, 23),
			minute: [0, 10, 20, 30, 40, 50]
		}
	};
	
	var Weather = require('./modules/weather');
	var weather = new Weather(config);
	
	weather.on('forecast', function(item) {
		var display = new matrix.Display();
		display.text(item.day, {color:'white'});
		display.text(sprintf('%s %d° (%d°)', item.condition, item.high, item.low),{color:'blue'});
		display.send();
	});
	
}

//////////////////////////////////////////////////////////////////////////////////////////

function enableRSS() {

	var config = {
		feeds: [
			{name: 'SvD',    url: 'http://www.svd.se/?service=rss&type=senastenytt'}, 
			{name: 'SDS',    url: 'http://www.sydsvenskan.se/rss.xml'}, 
			{name: 'Di',     url: 'http://www.di.se/rss'}, 
			{name: 'Google', url: 'http://news.google.com/news?pz=1&cf=all&ned=sv_se&hl=sv&topic=h&num=3&output=rss'}
		],
		schedule: {
			hour:   new schedule.Range(7, 23),
			minute: new schedule.Range(0, 59, 20)
		}

	};

	var RSS = require('./modules/rss');
	var rss = new RSS(config);

	rss.on('feed', function(rss) {
		matrix.text(sprintf('%s - %s - %s', rss.name, rss.category, rss.text));
	});
}

//////////////////////////////////////////////////////////////////////////////////////////


function test() {
	var rule = new schedule.RecurrenceRule();		
	
	rule.second = new schedule.Range(0, 59, 5);

	var job = schedule.scheduleJob(rule, function() {
		
		foo = [
			{
				type: 'text',
				text: 'Hej',
				color: 'yellow',
				priority: 'low'
				
			},
			{
				type: 'image',
				image: 'emoji/1.png',
				priority: 'low'
				
			}
		];
		
		matrix.emit('x-message', foo);
	});
		
}


//enableWeather();
enableQuotes();
//enableRates();
//enableMail();
//enablePing();
//enableRSS();

//test();

console.log('OK!');


