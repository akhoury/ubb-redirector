var http = require('http'),
    argv = require('optimist').argv,
    fse = require('fs-extra'),
    path = require('path'),
    mapFile = path.normalize(argv.m || argv.map ? argv.map : __dirname + '/map.sample.json'),
    map, prelog = '[ubb-redirect] ',

    ubbTopicPath = "ubbthreads.php/topics/",
    ubbForumPath = "ubbthreads.php/forums/",
    ubbUserPath = "ubbthreads.php/users/";

    if (fse.existsSync(mapFile)) {
        console.log(prelog + 'reading map file: ' + mapFile + ' please be patient...');
        map = fse.readJsonSync(mapFile);
    } else {
        throw new Error(prelog + '[Error] map file: ' + mapFile + ' does not exist.');
    }

var getNewRoute = function(route) {
    var newRoute = map.newRootPath;

    var topicIdx = route.indexOf(ubbTopicPath);
    if (topicIdx >= 0) {
        newRoute += appendToNewRoute(route, topicIdx, ubbTopicPath, "topics");
        return newRoute;
    }

    var forumIdx = route.indexOf(ubbForumPath);
    if (forumIdx >= 0) {
        newRoute += appendToNewRoute(route, forumIdx, ubbForumPath, "forums");
        return newRoute;
    }

    var userIdx = route.indexOf(ubbUserPath);
    if (userIdx >= 0) {
        newRoute += appendToNewRoute(route, userIdx, ubbUserPath, "users");
        return newRoute;
    }

    // todo the hardcoded ones

    // todo the images ones

    return newRoute;
};

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var appendToNewRoute = function (route, idx, ubbPath, key){
    var id = route.substr(idx + ubbPath.length);
    var slash = id.indexOf('/');
    if (slash >= 0) {
       id = id.substring(0, slash)
    }
    id = parseInt(id, 10);
    var newId = map[key].map[id]

    if (isNumber(id) && newId) {
        return map[key].newPrefix + newId;
    } else {
        return '';
    }
};

http.createServer(function (req, res) {

    var newRoute = getNewRoute(req.url);
    console.log(prelog + req.url + ' --> ' + newRoute);
    res.redirect('http://www.afraidtoask.com' + newRoute);

}).listen(1337, '127.0.0.1');

console.log('Ubb Redirect running at http://127.0.0.1:1337/');