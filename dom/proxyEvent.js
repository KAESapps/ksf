define([], function() {
	var generator = function(domEvent, targetEvent) {
		targetEvent = targetEvent || domEvent;
		return function() {
			var valueChange = function() {
				this._emit(targetEvent);
			}.bind(this);
			var domNode = this.get('domNode');
			domNode.addEventListener(domEvent, valueChange);
			this.own(function() {
				domNode.removeEventListener(domEvent, valueChange);
			});
		};
	};

	return {
		click: generator('click'),
		changed: generator('change', 'changed'),
		custom: generator
	};
});