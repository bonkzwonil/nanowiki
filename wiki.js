var restify = require('restify');

var server = restify.createServer(
{
  formatters: {
    'text/plain': function formatFoo(req, res, body) {
      if (body instanceof Error)
        return body.stack;

      if (Buffer.isBuffer(body)){
	  res.writeHead(200, {
	      'Content-Length': Buffer.byteLength(body),
	      'Content-Type': 'text/html'
	  });
          return body.toString();
      }

      return body;
    },
      'text/html': function(req, res, body){
	  return body;
      }
  }
});

server.use(restify.bodyParser({ mapParams: false })); 
server.use(restify.queryParser());

var redis = require('redis'),
    client = redis.createClient();

var util = require('util');

var Showdown = require('showdown');
var converter = new Showdown.converter();

client.on("error", function (err) {
        console.log("Error " + err);
});


var pre = "<html><body>";
var post = "</body></html>"

server.get('/:wiki', function(req, res, next){
    var page = req.params.wiki;
    var raw = "raw" === req.query.format;
    console.log(req.query);
    client.get(page, function(err, val){
	if(raw){
	    res.header('Content-Type','text/plain');
	    res.send(val);
	}else{
	    res.header('Content-Type','text/html');
	    res.send(pre+converter.makeHtml(val)+post);
	}
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
