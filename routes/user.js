
/*
 * GET users listing.
 */

var jsdom = require('jsdom');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.scrape = function(req, res) {
    request({
        uri: 'http://www.crunchbase.com/companies?c=z'
    }, function (err, response, body){
        jsdom.env({
            html: body,
            scripts: ['http://code.jquery.com/jquery-1.6.min.js']
        }, function(err, window) {
            var $ = window.jQuery,
                $body = $('body'),
                $results = $body.find('.search_result');
//
//            $results.each(function (i, result) {
//                var $desc = $(result).find('.search_result_preview').text(),
//                    $name = $(result).find('.search_result_name'),
//                    $link = $name.children('a').attr('href'),
//                    $company = $name.children('a').attr('title');
//
//                var jsonObj = {
//                    company: $company,
//                    link: $link,
//                    desc: $desc
//                }
//
//                console.log($desc);
//                db.companies.save(jsonObj, function(err, doc){
//                    console.log(doc);
//                    var words = jsonObj.desc.split(' ');
//                    for (var i = 0 ; i < words.length ; i++)
//                    {
//                        console.log('word:' + words[i] + ' ' + doc._id);
//                        db.companiesInd.update({_id:words[i]}, {$addToSet: {docs:doc._id}} , {upsert: 1});
//                    };
//                });
//            });

            console.log($('title').text());
            res.end($('title').text());
        });
        res.end('Done');
    });
};