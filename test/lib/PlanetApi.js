/**
 * @fileoverview Mini planet api, to get details about planets in our solar 
 * system.
 */

require('./../../lib/Array.find.polyfill.js')

/**
 * @constructor
 */
var PlanetApi = function(){

  this.planets = [
    new Planet("Mercury", 0.240846  , 47.362, 0   , 0.055   , 0.38  ),
    new Planet("Venus"  , 0.615198  , 35.02 , 0   , 0.815   , 0.904 ),
    new Planet("Earth"  , 1         , 29.78 , 1   , 1       , 1     ),
    new Planet("Mars"   , 1.8808    , 24.077, 2   , 0.107   , 0.376 ),
    new Planet("Jupiter", 11.8618   , 9.69  , 67  , 317.8   , 2.528 ),
    new Planet("Saturn" , 29.4571   , 13.07 , 62  , 95.152  , 1.065 ),
    new Planet("Uranus" , 84.016846 , 6.80  , 27  , 14.536  , 0.886 ),
    new Planet("Neptune", 164.8     , 5.43  , 14  , 17.147  , 1.14  ),
    new Planet("Pluto"  , 247.68    , 4.7   , 5   , 0.002   , 0.063 )
  ]
}


/**
 * @param {string} name The planet name
 * @return {object}
 */
PlanetApi.prototype.getDetails = function(name, callback){
  var planet = this.planets.find(function(p){
    return p.name.toLowerCase() == name.toLowerCase();
  });
  if (!planet) return callback(new Error("Planet not found"));
  callback(null, planet);
};

module.exports = PlanetApi;


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

  var callback = arguments[arguments.length - 1];
  var maxOrbitalPeriod = (typeof opt_maxOrbitalPeriod == 'function' || 
    opt_maxOrbitalPeriod == null) ? undefined : opt_maxOrbitalPeriod;

  var planets = this.planets.filter(function(planet){
    return (
      (minOrbitalSpeed < planet['orbitalSpeed'])
      && (!maxOrbitalPeriod || 
        maxOrbitalPeriod > planet['orbitalPeriod']));
  });

  planets.sort(function(a, b){
    return (a['orbitalSpeed'] < b['orbitalSpeed']);
  })

  callback(null, planets);
};

/**
 * @param {object} filterObj. Can accept maxMoons and minMoons as a property
 * @param {Function} callback
 */
PlanetApi.prototype.filterBy = function(filterObj, callback){
  callback(null, this.planets.filter(function(planet){
    if (filterObj['maxMoons'] && planet.satellites > filterObj['maxMoons'])
      return false;
    if (filterObj['minMoons'] && planet.satellites < filterObj['minMoons'])
      return false;
    return true;
  }));
};

/**
 * @constructor
 */
function Planet(name, orbitalPeriod, orbitalSpeed, satellites, mass, gravity){
  this.name = name;
  this.orbitalPeriod = orbitalPeriod, // in years
  this.orbitalSpeed = orbitalSpeed, // km/s
  this.satellites = satellites,
  this.mass = mass, // 0.055 earths
  this.gravity = gravity; // g
};