define([], function() {
	return {
		_on: function(type, cb){
			this._listeners || (this._listeners = {});
			var listeners = this._listeners[type] || (this._listeners[type] = []);
			listeners.push(cb);
			return function() {
				listeners.splice(listeners.indexOf(cb), 1);
			};
		},
		_emit: function(type, event){
			var listeners = this._listeners && this._listeners[type];
			if (listeners) {
				var length = listeners.length;
				for (var i=0; i < length; i++) {
					listeners[i](event);
				}
			}
		}
	};
});