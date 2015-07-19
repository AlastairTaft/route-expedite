/**
 * @fileoverview Test on a server setup with routing from the direct package.
 */


var http = require('http'),
  director = require('director'),
  PlanetApi = require('./lib/PlanetApi.js')
  expedite = require('./../'),
  request = require('request'),
  expect = require('chai').expect;


var port = 8080;

describe('direct', function() {  

  var router, planetApi,
   baseUrl = 'http://localhost:' + port;
  before(function(){

    planetApi = new PlanetApi();

    //
    // define a routing table.
    //
    //var router = new director.http.Router();
    router = new director.http.Router().configure({ async: true });


    router.get('/:name', expedite(planetApi, 'getDetails'));
    router.post('/planet/fastestOrbits', expedite(planetApi, 'getFastestOrbits'));
    router.post('/planet/filterBy', expedite(planetApi, 'filterBy'));
    router.get('/test/:msg', expedite(function(msg, callback){
      callback(null, msg)
    }));

    //
    // setup a server and when there is a request, dispatch the
    // route that was requested in the request object.
    //
    var server = http.createServer(function (req, res) {
      
      req.chunks = [];
      req.on('data', function (chunk) {
        req.chunks.push(chunk.toString());
      });

      router.dispatch(req, res, function (err) {
        if (err) {
          res.writeHead(404);
          res.end();
        }

        console.log('Served ' + req.url);
      });
    });

    //
    // set the server to listen on port `8080`.
    //
    server.listen(port);

  })

  describe('#getDetails()', function() {
    it('should return jupiter\'s details', function(done) {

      request(baseUrl + '/jupiter', function (err, res, body) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        var dets = JSON.parse(body);
        expect(dets['gravity']).to.equal(2.528);
        done()
      })

    })
  });
  describe('test method with parameters in query with optional parameters ommitted', function() {
    it('should return an array of planet details', function(done) {
      request.post(baseUrl + '/planet/fastestOrbits?minOrbitalSpeed=20',
        function (err, res, planets) {
        if (err) throw err;
        debugger;
        expect(res.statusCode).to.equal(200);
        planets = JSON.parse(planets)
        expect(planets.length).to.equal(4);
        expect(planets[0].name).to.equal("Mercury");
        done()
      })
    })
  })
  describe('test method with parameters in body with optional parameters ommitted', function() {
    it('should return an array of planet details', function(done) {
      request({
        method: 'post',
        body: {
          minOrbitalSpeed: 20 //,
          //maxOrbitalPeriod: 1.5
        },
        json: true,
        url: baseUrl + '/planet/fastestOrbits'
      }, function (err, res, planets) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        expect(planets.length).to.equal(4);
        expect(planets[0].name).to.equal("Mercury");
        done()
      })
    })
  })

  describe('test method with parameters in query with optional parameters included', function() {
    it('should return an array of planet details', function(done) {
      request.post(baseUrl + '/planet/fastestOrbits?minOrbitalSpeed=20&maxOrbitalPeriod=1.5',
        function (err, res, planets) {
        if (err) throw err;
        debugger;
        expect(res.statusCode).to.equal(200);
        planets = JSON.parse(planets)
        expect(planets.length).to.equal(3);
        expect(planets[2].name).to.equal("Earth");
        done()
      })
    })
  })
  describe('test method with parameters in body with optional parameters ommitted', function() {
    it('should return an array of planet details', function(done) {
      request({
        method: 'post',
        body: {
          minOrbitalSpeed: 20,
          maxOrbitalPeriod: 1.5
        },
        json: true,
        url: baseUrl + '/planet/fastestOrbits'
      }, function (err, res, planets) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        expect(planets.length).to.equal(3);
        expect(planets[2].name).to.equal("Earth");
        done()
      })
    })
  })
  describe('test method with object as parameter in body', function() {
    it('should return an array of planet details', function(done) {
      request({
        method: 'post',
        body: {
          filterObj: {
            maxMoons: 40,
            minMoons: 10
          }
        },
        json: true,
        url: baseUrl + '/planet/filterBy'
      }, function (err, res, planets) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        expect(planets.length).to.equal(2);
        expect(planets[0].name).to.equal("Uranus");
        done()
      })
    })
  })
  describe('test static function', function() {
    it('should return the same message passed in', function(done) {
      request(baseUrl + '/test/test_message', function (err, res, msg) {
        if (err) throw err;
        expect(res.statusCode).to.equal(200);
        msg = JSON.parse(msg);
        expect(msg).to.equal('test_message');
        done()
      })
    })
  })
})
