(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var compose = require('./utils/compose');

var Person = compose({
	speek: function() {
		console.log('heello');
	}
});

new Person().speek();
},{"./utils/compose":2}],2:[function(require,module,exports){
var compose = function (base) {
    var constructors = [];
    var prototypes = [];
    var trait;
    var i, props;
    for (i = 0; i < arguments.length; i++) {
        trait = arguments[i];
        if (typeof trait === 'function') {
            constructors.push(trait);
            prototypes.push(trait.prototype);
        } else {
            prototypes.push(trait);
        }
    }
    var constructorsLenght = constructors.length;
    var Ctr = function () {
        for (i = 0; i < constructorsLenght; i++) {
            constructors[i].apply(this, arguments);
        }
    };
    Ctr.prototype = Object.create(typeof base === 'function' ? base.prototype : base);
    for (i = 1; i < prototypes.length; i++) {
        props = prototypes[i];
        for (var key in props) {
            Ctr.prototype[key] = props[key];
        }
    }
    return Ctr;
};
compose.create = function (base) {
    var trait, instance, i, l, props;
    var constructors = [];
    if (typeof base === 'function') {
        instance = Object.create(base.prototype);
        constructors.push(base);
    } else {
        instance = Object.create(base);
    }
    for (i = 1, l = arguments.length; i < l; i++) {
        trait = arguments[i];
        if (typeof trait === 'function') {
            constructors.push(trait);
            props = trait.prototype;
        } else {
            props = trait;
        }
        for (var key in props) {
            instance[key] = props[key];
        }
    }
    for (i = 0, l = constructors.length; i < l; i++) {
        constructors[i].call(instance);
    }
    return instance;
};
module.exports = compose;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvbWVkaWEvc3lsdmFpbi9kYXRhL3Byb2plY3RzL2tzZi9zcmMvY29tcG9zZS1icm93c2VyaWZ5LmpzIiwiL21lZGlhL3N5bHZhaW4vZGF0YS9wcm9qZWN0cy9rc2Yvc3JjL3V0aWxzL2NvbXBvc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY29tcG9zZSA9IHJlcXVpcmUoJy4vdXRpbHMvY29tcG9zZScpO1xuXG52YXIgUGVyc29uID0gY29tcG9zZSh7XG5cdHNwZWVrOiBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnaGVlbGxvJyk7XG5cdH1cbn0pO1xuXG5uZXcgUGVyc29uKCkuc3BlZWsoKTsiLCJ2YXIgY29tcG9zZSA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgdmFyIGNvbnN0cnVjdG9ycyA9IFtdO1xuICAgIHZhciBwcm90b3R5cGVzID0gW107XG4gICAgdmFyIHRyYWl0O1xuICAgIHZhciBpLCBwcm9wcztcbiAgICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRyYWl0ID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIHRyYWl0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcnMucHVzaCh0cmFpdCk7XG4gICAgICAgICAgICBwcm90b3R5cGVzLnB1c2godHJhaXQucHJvdG90eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3RvdHlwZXMucHVzaCh0cmFpdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIGNvbnN0cnVjdG9yc0xlbmdodCA9IGNvbnN0cnVjdG9ycy5sZW5ndGg7XG4gICAgdmFyIEN0ciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbnN0cnVjdG9yc0xlbmdodDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RvcnNbaV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQ3RyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUodHlwZW9mIGJhc2UgPT09ICdmdW5jdGlvbicgPyBiYXNlLnByb3RvdHlwZSA6IGJhc2UpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBwcm90b3R5cGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHByb3BzID0gcHJvdG90eXBlc1tpXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHByb3BzKSB7XG4gICAgICAgICAgICBDdHIucHJvdG90eXBlW2tleV0gPSBwcm9wc1trZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBDdHI7XG59O1xuY29tcG9zZS5jcmVhdGUgPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgIHZhciB0cmFpdCwgaW5zdGFuY2UsIGksIGwsIHByb3BzO1xuICAgIHZhciBjb25zdHJ1Y3RvcnMgPSBbXTtcbiAgICBpZiAodHlwZW9mIGJhc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaW5zdGFuY2UgPSBPYmplY3QuY3JlYXRlKGJhc2UucHJvdG90eXBlKTtcbiAgICAgICAgY29uc3RydWN0b3JzLnB1c2goYmFzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5zdGFuY2UgPSBPYmplY3QuY3JlYXRlKGJhc2UpO1xuICAgIH1cbiAgICBmb3IgKGkgPSAxLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0cmFpdCA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiB0cmFpdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY29uc3RydWN0b3JzLnB1c2godHJhaXQpO1xuICAgICAgICAgICAgcHJvcHMgPSB0cmFpdC5wcm90b3R5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9wcyA9IHRyYWl0O1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBwcm9wcykge1xuICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IHByb3BzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChpID0gMCwgbCA9IGNvbnN0cnVjdG9ycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY29uc3RydWN0b3JzW2ldLmNhbGwoaW5zdGFuY2UpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBjb21wb3NlOyJdfQ==
