define([], function() {
	var generator = function(domEvent, targetEvent) {
		targetEvent = targetEvent || domEvent;
		return function() {
			var valueChange = function(ev) {
				this._emit(targetEvent, ev);
			}.bind(this);
			var domNode = this.domNode;
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