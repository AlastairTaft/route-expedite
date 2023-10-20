# ⚠️ Archived
This repo is not maintained and old. I would recommend not using it.

# route-expedite

Currently works with express/connect and director.

Express sample code
```
var genRoute = require('route-expedite')
app.use('/api/getAccounts', genRoute(cashflowDb, 'selectAccounts'))
```

Director sample code
```
    router = new director.http.Router().configure({ async: true });
    router.get('/:name', expedite(planetApi, 'getDetails'));
    router.post('/planet/fastestOrbits', expedite(planetApi, 'getFastestOrbits'));
    router.post('/planet/filterBy', expedite(planetApi, 'filterBy'));
    // Static function example
    router.get('/test/:msg', expedite(function(msg, callback){
      callback(null, msg)
    }));
```

(see mocha test for more exampels)

You can indicate a function paramater is optional by prepending 'opt_' to it. But you're request url should not use the opt, so your request url might look like 
```
http://localhost/planet/fastestOrbits?minOrbitalSpeed=20&maxOrbitalPeriod=1.5 ```

and your end point function would look something like...

```
/**
 * Get an array of planets in order with the fastest orbital speeds first
 * @param {number} minOribitalSpeed Don't return any planets with an orbital 
 * speed below this
 * @param {number} opt_maxOrbitalPeriod Don't return any planets that exceed
 * this orbital period
 * @return {Array}
 */
PlanetApi.prototype.getFastestOrbits = function(minOrbitalSpeed, 
  opt_maxOrbitalPeriod, cb){

  ... Do stuff ...

}
```

## Mapping algorithm
Maps the parameters in order from the router handler function to the data provider function, if in async mode ignores the last router handler function.
When there are more data handler parameters than parameters provided to the router handler it will assume the body of the request is json and look for the parameter names in the body.

Assumes the last parameter of the data function is a callback, which provides an optional error object.

Allows the api method to define optional parameters by prefixing the variable names with 'opt_'. Optional methods should always be defined after required parameters.
