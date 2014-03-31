define([
	'compose',
	'../WithSize'
], function(
	compose,
	WithSize
){
	return compose(WithSize, function() {
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