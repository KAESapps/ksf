define(['./onDomEvent'], function(onDomEvent) {
	return function(eventName) {
		return function(listener) {
			return onDomEvent(this.domNode, eventName, listener);
		};
	};
});