var express = require('express'),
	argv = require('optimist').argv,
	fse = require('fs-extra'),
	_ = require('underscore'),
	path = require('path'),
	mapFile = path.normalize(argv.m || argv.map || __dirname + '/map.sample.json'),
	Map,

// all these are preceeded by the Map.ubbRootPath value automatically
	ubbTopicPath = "ubbthreads.php/topics/",
	ubbForumPath = "ubbthreads.php/forums/",
	ubbUserPath = "ubbthreads.php/users/",
	ubbImagesPath = "images/",

	mapDefaults =
	{
		"ubbSiteRootDir": __dirname,
		"ubbRootPath": "/forums",

		"newSiteRootUrl": "http://example.com",
		"newRootPath": "/forum",

		"hard": {
			"newPrefix": "",
			"map": {
				"ubb/login":"login",
				"ubb/newuser":"register"
			}
		},

		"forums": {
			"newPrefix": "category/",
			"map": {
				"1": "1"
			}
		},

		"users": {
			"newPrefix": "user/",
			"map": {
				"1": "admin"
			}
		},

		"topics": {
			"newPrefix": "topic/",
			"map": {
				"1": "1"
			}
		}
	};

var log = argv.v || argv.verbose ? function(msg){ console.log('[ubb-redirect] ' + msg ); } : function(){};

if (fse.existsSync(mapFile)) {
	log('reading map file: ' + mapFile + ' please be patient...');
	Map = _.extend(mapDefaults, fse.readJsonSync(mapFile) || {});
} else {
	var er = new Error('[Error] map file: ' + mapFile + ' does not exist.');
	log(er);
	throw er;
}

var getNewRoute = function(route) {
	var newRoute = Map.newRootPath + '/';

	var topicIdx = route.indexOf(ubbTopicPath);
	if (topicIdx >= 0) {
		log(route + ' looks like a ubb topic\'s page path');
		newRoute += appendToNewRoute(route, topicIdx, ubbTopicPath, "topics");
		return newRoute;
	}

	var forumIdx = route.indexOf(ubbForumPath);
	if (forumIdx >= 0) {
		log(route + ' looks like a ubb forum\'s page path');
		newRoute += appendToNewRoute(route, forumIdx, ubbForumPath, "forums");
		return newRoute;
	}

	var userIdx = route.indexOf(ubbUserPath);
	if (userIdx >= 0) {
		log(route + ' looks like a ubb user\'s profile page path');
		newRoute += appendToNewRoute(route, userIdx, ubbUserPath, "users");
		return newRoute;
	}

	var imageIdx = route.indexOf(ubbImagesPath);
	if (imageIdx >= 0) {
		log(route + ' looks like a ubb static path');
		return '';
	}

	// no? check if any of the hardcoded ones
	if(Object.keys(Map.hard.map).some(function(hardRoute){
		if (route.indexOf(hardRoute) >= 0) {
			log(route + ' looks like a hardcoded route.');
			newRoute += Map.hard.newPrefix + Map.hard.map[hardRoute];
			return true;
		}
	})) return newRoute;

	// anything else?

	return newRoute;
};

var isNumber = function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

var appendToNewRoute = function (route, idx, ubbPath, key){
	var id = parseInt((route.substr(idx + ubbPath.length) || '').split('/')[0] || '', 10);
	var newId = isNumber(id) ? Map[key].map[id] : '';
	return newId ? Map[key].newPrefix + newId : '';
};

var app = express();

// ubb static images
var oldImagesDir = path.resolve(path.normalize(Map.ubbSiteRootDir + Map.ubbRootPath + path.sep + ubbImagesPath));
var staticPath = Map.ubbRootPath + path.sep + ubbImagesPath;
log(staticPath + ' will direct to your static ubbImages, they should live in: ' + oldImagesDir);

app.use(staticPath, express.static(oldImagesDir));

var hasProtocol = Map.newSiteRootUrl.match(/^http(?:s)?:\/\//);
app.get('*', function(req, res) {
	var newRoute = getNewRoute(req.url);
	var redirectTo = (hasProtocol ? Map.newSiteRootUrl : req.protocol + '://' + Map.newSiteRootUrl) + (newRoute || '');

	log(req.url + ' --> ' + redirectTo);
	res.redirect(301, redirectTo);
});

var port = argv.p || argv.port || 3000;
var host = argv.h || argv.host || 'localhost';
app.listen(port, host);
log('running on ' + host + ':' + port);
