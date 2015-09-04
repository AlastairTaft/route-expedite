/**
 * Maps a router function to any method. Avoids writing boiler plate code to do
 * this job.
 */

require('./lib/String.startsWith.polyfill.js')

var IncomingMessage = require('http').IncomingMessage

 
module.exports = function(funcOrObject, funcName){

  var func, context;
  if (typeof funcOrObject == 'function'){
    func = funcOrObject;
    context = null;
  } else {
    if (!funcName){
      throw "function name must be provided as the second parameter"
    }
    func = funcOrObject[funcName];
    context = funcOrObject;
  }


  var fParamNames = getParamNames(func)
  fParamNames.forEach(function(str, i){
    if (str.toLowerCase().startsWith('opt_'))
      fParamNames[i] = str.slice(4)
  })

  return function(req, res, next){
    // director, req will be the callback
    // express, next will be the callback
    
    var self = this;
    
    if (arguments[0] instanceof IncomingMessage){
      // Assume connect
      this.req = arguments[0]
      this.res = arguments[1]
      var args = Array.prototype.slice.call(arguments, 3);
      
    } else {
      // Start taking the arguments from the router
      var args = Array.prototype.slice.call(arguments);
      // Assume it's always async, the last param is something like next or done
      var next = args.pop();
    }

    // Assume it's always async, the last param is something like next or done
    //var next = args.pop();

    var url = require('url').parse(this.req.url, true);

    // Try and grab the remaining parameters 
    for (var i = args.length; i < (fParamNames.length - 1); i++){
      var pName = fParamNames[i];
      
      // first from the query string
      if (url.query.hasOwnProperty(pName)){
        args.push(url.query[pName])
        continue;
      }

      // Then try the request body if it exists
      if (this.req.body){
        args.push(this.req.body[pName]);
        continue
      } else {
        // Don't add the parameter
      }

      // We don't have a parameter we were expecting, let's notify the user
      return sendError.call(this, (new Error(pName + ' parameter not found')))
    }

    // Add the callback
    args.push(function(err, val){
      if (err) return next(err);
      var json = JSON.stringify(val)
      self.res.writeHead(200
        , { 
          'content-type': 'text/json' 
          , 'content-length': Buffer.byteLength(json, ['utf8'])
        }
      )
      self.res.write(json, function(){
        //var util = require('util')
        //console.log(util.inspect(self.res))
        //self.res.end();
        //console.log('next called')
        //next()
        self.res.end()  
        
      })
      //next(null, JSON.stringify(val))
    });

    func.apply(context, args);
  }
};





// Taken from 
// http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript?answertab=votes#tab-top
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

/**
 * Send an error message to the client
 */
function sendError(err){
  var self = this
  var responseJson = JSON.stringify({
    'message': err.message
  })
  this.res.writeHead(400
    , { 
      'content-type': 'text/json' 
      , 'content-length': Buffer.byteLength(responseJson, ['utf8'])
    }
  )
  this.res.write(responseJson, function(){
    //var util = require('util')
    //console.log(util.inspect(self.res))
    //self.res.end();
    //console.log('next called')
    //next()
    self.res.end()  
    
  })
}

