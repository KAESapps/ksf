define([
	'compose',
	'ksf/collections/Set',
], function(
	compose,
	Set
){
	return compose(function() {
		this._notAppliedAttrs = new Set();
	}, {
		_applyAttrs: function() {
			// v----rendering log----v
			var timer = "apply attrs";
			if (window.renderingLog) {
				console.time(timer);
			}
			// ^----rendering log----^

			var domNode = this.domNode;
			this._notAppliedAttrs.forEach(function(attr) {
				domNode[attr] = this.get(attr);
			}.bind(this));
			this._notAppliedAttrs.clear();

			// v----rendering log----v
			console.timeEnd(timer);
			// ^----rendering log----^

		},

	});
});