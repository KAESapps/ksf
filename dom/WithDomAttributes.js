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
			var domNode = this.domNode;
			this._notAppliedAttrs.forEach(function(attr) {
				domNode[attr] = this.get(attr);
			}.bind(this));
			this._notAppliedAttrs.clear();
		},

	});
});