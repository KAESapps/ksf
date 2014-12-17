define([], function(){
	return function(domNode, eventName, cb) {
		domNode.addEventListener(eventName, cb);
		return function() {
			domNode.removeEventListener(eventName, cb);
		};
	};
});