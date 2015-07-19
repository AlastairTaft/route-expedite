/**
 * Maps a router function to any method. Avoids writing boiler plate code to do
 * this job.
 */

require('./lib/String.startsWith.polyfill.js')

 
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

  return function(){
    debugger;

    

    

    var self = this;
    // Start taking the arguments from the router
    var args = Array.prototype.slice.call(arguments);

    // Assume it's always async, the last param is something like next or done
    var next = args.pop();

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
      } else {
        // Don't add the parameter
      }
    }

    // Add the callback
    args.push(function(err, val){
      if (err) return next(err);
      self.res.writeHead(200, { 'content-type': 'text/json' });
      self.res.write(JSON.stringify(val))
      self.res.end();
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


