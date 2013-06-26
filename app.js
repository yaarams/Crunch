
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , request = require('request')
  , jsdom = require('jsdom')
  , url = require('url');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/scrape', user.scrape);
app.get('/users', user.list);

var db = require("mongojs").connect('test', ['companies', 'companiesInd']);

app.get('/findRegex', function (req, res){
    db.companies.find({desc: { $regex: req.query.text, $options:'i'}}, function(err, result){
        console.log(result);
    });
});

app.get('/findIndex', function (req, res){
    db.companiesInd.find({ _id: req.query.text }, function(err, result) {
        res.send(result);
    });
});

app.get('/findWord', function (req, res){
    db.companiesInd.find({ _id: req.query.text }, function(err, result) {
        var ids = result[0].docs;
        console.log(ids.length);
        db.companies.find({_id: {$in: ids}}, function(err, result) {
            res.send(result);
        });
    });
});

//search all companies containing face - oops (this is not what you meant.. should be companies?c=a..z)
app.get('/crunchscrape', function (req, res){
    request({
        uri: 'http://www.crunchbase.com/search?query=face'
    }, function (err, response, body){
        jsdom.env({
            html: body,
            scripts: ['http://code.jquery.com/jquery-1.6.min.js']
        }, function(err, window) {
            var $ = window.jQuery,
                $body = $('body'),
                $results = $body.find('.search_result');

            $results.each(function (i, result) {
                var $desc = $(result).find('.search_result_preview').text(),
                    $name = $(result).find('.search_result_name'),
                    $link = $name.children('a').attr('href'),
                    $company = $name.children('a').attr('title');

                var jsonObj = {
                    company: $company,
                    link: $link,
                    desc: $desc
                }

                console.log($desc);
                db.companies.save(jsonObj, function(err, doc){
                    console.log(doc);
                    var words = jsonObj.desc.split(' ');
                    for (var i = 0 ; i < words.length ; i++)
                    {
                        console.log('word:' + words[i] + ' ' + doc._id);
                        db.companiesInd.update({_id:words[i]}, {$addToSet: {docs:doc._id}} , {upsert: 1});
                    };
                });
            });

            console.log($('title').text());
            res.end($('title').text());
        });
        res.end('Done');
    });
});

//get all companies that begin with z
//TODO - get all companies, split to methods and place in dedicated js file
//    ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
app.get('/crunchscrapefull', function (req, res) {
    request({
        uri: 'http://www.crunchbase.com/companies?c=z'
    }, function (err, response, body) {
        jsdom.env({
            html: body,
            scripts: ['http://code.jquery.com/jquery-1.6.min.js']
        }, function(err, window) {

            var $ = window.jQuery,
                $a = $('body .col2_table_listing tr td ul li a'),
                companies = [];

            $a.each(function(i, item) {

                var href = $(item).attr('href'),
                    title = $(item).attr('title');

                request({
                    uri: 'http://www.crunchbase.com' + href
                }, function (err, response, body) {
                    jsdom.env({
                        html: body,
                        scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                    }, function(err, window) {

                        $ = window.jQuery;
                        var obj = {
                            title: title,
                            desc: $ ? $('#col2_internal p').text() : '',
                            href: href
                        };
                        // console.log(obj);
                        companies += obj;

                        db.companies.save(obj, function(err, doc){
                            console.log(doc);
                            var words = obj.desc.split(' ');
                            for (var i = 0 ; i < words.length ; i++)
                            {
//                                console.log('word:' + words[i] + ' ' + doc._id);
                                db.companiesInd.update({_id:words[i]}, {$addToSet: {docs:doc._id}} , {upsert: 1});
                            };
                        });
                    });
                });
            });
            res.end('Scraping...');
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
