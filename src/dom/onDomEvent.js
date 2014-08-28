define([], function() {
	return function(eventName) {
		return function(listener) {
			var domNode = this.domNode,
				domEventName = eventName;
			domNode.addEventListener(domEventName, listener);
			return function() {
				domNode.removeEventListener(domEventName, listener);
			};
		};
	};
});