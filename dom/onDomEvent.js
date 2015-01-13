define([], function(){
	return function(domNode, eventName, cb, capture) {
		domNode.addEventListener(eventName, cb, capture);
		return function() {
			domNode.removeEventListener(eventName, cb, capture);
		};
	};
});