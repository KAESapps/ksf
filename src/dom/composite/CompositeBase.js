define([
	'compose',
	'../WithSize',
	'ksf/base/Destroyable',
], function(
	compose,
	WithSize,
	Destroyable
){
	return compose(Destroyable, WithSize, function() {
		this._root = this._rootFactory();
		this.domNode = this._root.domNode;
	}, {
		inDom: function(inDom) {
			this._root.inDom && this._root.inDom(inDom);
		},
		bounds: function(bounds) {
			this._root.bounds && this._root.bounds(bounds);
		}
	});
});