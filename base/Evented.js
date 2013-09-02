define([
	'compose'
], function(
	compose
){
	return compose(function() {
		this._listeners = {};
	}, {
		on: function(type, cb){
			var listeners = this._listeners[type] || (this._listeners[type]= []);
			listeners.push(cb);
			return {
				destroy: function(){
					listeners.delete(cb);
					if(!listeners.length) {
						delete this._listeners[type];
					}
				}.bind(this)
			};
		},
		_emit: function(type, event){
			if (this._emitPaused){
				this._pendingEvents.push([type, event]);
			} else {
				event = event || {};
				event.type = type;
				event.emiter = this;
				this._listeners && this._listeners[type] && this._listeners[type].forEach(function(listener){
					listener(event);
				});
			}
		}
	});
});