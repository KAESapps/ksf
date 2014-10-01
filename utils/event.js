define([
], function(
){
	return function() {
		var listeners;
		var eventEmitter = function(cb) {
			listeners || (listeners = []);
			listeners.push(cb);
			return function() {
				listeners.splice(listeners.indexOf(cb), 1);
			};
		};
		eventEmitter.emit = function(event) {
			if (listeners) {
				var length = listeners.length;
				for (var i=0; i < length; i++) {
					listeners[i](event);
				}
			}

		};
		return eventEmitter;
	};
});