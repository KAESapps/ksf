define([], function() {
	return function(eventName) {
		return function(listener) {
			var self = this;
			var domNode = this.domNode,
				cb = function(ev) {
					setTimeout(function() {
						listener.call(self, ev);
					});
				};
			domNode.addEventListener(eventName, cb);
			return function() {
				domNode.removeEventListener(eventName, cb);
			};
		};
	};
});