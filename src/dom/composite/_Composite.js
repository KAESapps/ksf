define([
	'compose',
	'../../base/_Destroyable',
	'../../base/_Evented',
	'../_WithSize'
], function(
	compose,
	_Destroyable,
	_Evented,
	_WithSize
){
	return compose(_Destroyable, _Evented, _WithSize, function() {
		this._root = this._own(this._rootFactory());
		this.domNode = this._root.domNode;
	}, {
		inDom: function(inDom) {
			this._root.inDom && this._root.inDom(inDom);
		},
		bounds: function(bounds) {
			this._root.bounds && this._root.bounds(bounds);
		},
	});
});