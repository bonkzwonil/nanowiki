var restify = require('restify');

var server = restify.createServer(
{
  formatters: {
    'text/plain': function formatFoo(req, res, body) {
      if (body instanceof Error)
        return body.stack;

      if (Buffer.isBuffer(body))
        return body.toString('base64');

      return util.inspect(body);
    }}
});

server.use(restify.bodyParser({ mapParams: false })); 

var redis = require('redis'),
    client = redis.createClient();

var util = require('util');

var Showdown = require('showdown');
var converter = new Showdown.converter();

client.on("error", function (err) {
        console.log("Error " + err);
});



server.get('/:wiki', function(req, res, next){
    var page = req.params.wiki;
    client.get(page, function(err, val){
	res.send(converter.makeHtml(val));
	next();
    });
});

server.post('/:wiki', function(req, res, next){
    var page = req.params.wiki;
    client.set(page, req.body, function(err, val){
	if(err) {
	    res.send(err);
	}else{
	    res.send("OK");
	}
	next();
    });
});


server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
