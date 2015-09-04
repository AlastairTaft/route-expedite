# route-expedite

Currently works with express/connect (and maybe director).

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

## Mapping algorithm
Maps the parameters in order from the router handler function to the data provider function, if in async mode ignores the last router handler function.
When there are more data handler parameters than parameters provided to the router handler it will assume the body of the request is json and look for the parameter names in the body.

Assumes the last parameter of the data function is a callback, which provides an optional error object.

Allows the api method to define optional parameters by prefixing the variable names with 'opt_'. Optional methods should always be defined after required parameters.